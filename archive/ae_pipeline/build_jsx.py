#!/usr/bin/env python3
"""テロップJSONを検証し、データ埋め込み済みのAE用jsxを生成する。"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


VALID_STYLES = {f"S{i}" for i in range(1, 7)}
STYLE_IN_TEXT_RE = re.compile(r"(?<![A-Za-z0-9])(S[1-6])(?:\([^)]*\))?")
QUOTED_RE = re.compile(r"[「『](.*?)[」』]")
CUT_RANGE_RE = re.compile(r"^([A-Za-z]+)(\d+)(?:-([A-Za-z]+)(\d+))?$")
MOTION_TAG_RE = re.compile(r"\[(pos|maxchar|offset):([^\]]+)\]")
VALID_POSITIONS = {"center", "left", "right", "top", "bottom"}
DEFAULT_MAXCHARS = {"S2": 13, "S3": 20, "S4": 7}
BREAK_PARTICLES = ("けれど", "けど", "ので", "のに", "から", "まで", "なら", "ても", "では", "には", "とは", "って", "は", "が", "を", "に", "で", "と", "へ", "も", "の")
POSITION_WORD_RE = re.compile(
    r"画面(?:の)?(?:左|右|上部|下部|隅)|左(?:側|寄せ|下|上)|右(?:側|寄せ|下|上)|"
    r"中央(?:上|下)|上(?:部|寄せ|1/3)|下(?:部|寄せ|1/3)"
)

# AEを起動しないcheckモード用の概算値。trackingは1/1000 emとして加算する。
# S5は数字が120pxになるため、安全側に120pxで見積もる。
STYLE_WIDTH_METRICS = {
    "S2": {"size": 78, "long_size": 64, "tracking": 100},
    "S3": {"size": 60, "tracking": 75},
    "S4": {"size": 84, "tracking": 150},
    "S5": {"size": 120, "tracking": 0},
    "S6": {"size": 120, "tracking": -50},
}

# 表示本文ではなく、末尾に付けられた制作指示として安全に除去できるものだけを
# 列挙する。新しい注記は勝手に消さず、必要になった時点でここへ追加する。
PRODUCTION_NOTE_WHITELIST = (
    "この一文のみ",
    "タイトル",
    "3行順次",
    "2つの問いを順に中央表示",
    "引用スタイル",
    "表紙合成",
    "ロゴ扱い",
    "タイトル呼応",
    "C20と同一スタイル・同一位置",
    "次回タイトル",
    "メニュー内",
)


# ExtendScriptはES3相当で実行できる書き方に限定する。__TELOP_DATA__だけを
# Python側でJS配列リテラルへ置換するため、AE側でJSON.parseする必要がない。
JSX_TEMPLATE = r'''#target aftereffects

/*
 * 『なんだろう』解体 S2〜S6テロップ自動配置
 * build_jsx.pyがJSONをこのファイルへ直接埋め込んでいます。
 * 実行: ファイル > スクリプト > スクリプトファイルを実行
 */
(function () {
    var DATA = __TELOP_DATA__;
    var FPS = 23.976;
    var warnings = [];
    var placed = 0;
    var skipped = 0;

    // フォントのPostScript名はこのFONTSだけを直せば全styleへ反映される。
    var FONTS = {
        EMPHASIS_BOLD: ["SourceHanSans-Bold", "NotoSansCJKjp-Medium"],
        QUOTE_REGULAR: ["ShipporiMincho-Regular"],
        SANS_JP_MEDIUM: ["NotoSansCJKjp-Medium"],
        SANS_JP_HEAVY: ["SourceHanSans-Bold"],
        LATIN_NUMBER: ["Oswald-Regular"]
    };

    var STYLES = {
        S2: {fonts: FONTS.EMPHASIS_BOLD, size: 78, longSize: 64, tracking: 100, color: [0.918, 0.902, 0.875], label: 2},
        S3: {fonts: FONTS.QUOTE_REGULAR, size: 60, tracking: 75, color: [0.918, 0.902, 0.875], label: 10},
        S4: {fonts: FONTS.EMPHASIS_BOLD, size: 84, tracking: 150, color: [0.918, 0.902, 0.875], label: 1},
        S5: {fonts: FONTS.SANS_JP_MEDIUM, digitFonts: FONTS.LATIN_NUMBER, size: 40, digitSize: 120, tracking: 0, color: [1, 1, 1], label: 11},
        S6: {fonts: FONTS.SANS_JP_HEAVY, size: 120, tracking: -50, color: [1, 1, 1], label: 9}
    };

    // タグのpos名を1920x1080上の基準座標へ対応させる。
    var POSITIONS = {
        center: [960, 540],
        left: [480, 540],
        right: [1440, 540],
        top: [960, 300],
        bottom: [960, 780]
    };

    function logWarning(message) {
        warnings.push(message);
        $.writeln("[NANDAROU WARNING] " + message);
    }

    function tcToSeconds(tc) {
        var p = tc.split(":");
        return Number(p[0]) * 3600 + Number(p[1]) * 60 + Number(p[2]);
    }

    function frameTime(frames) {
        return frames / FPS;
    }

    function fontExists(postScriptName) {
        try {
            return app.fonts && app.fonts.getFontsByPostScriptName(postScriptName).length > 0;
        } catch (error) {
            return false;
        }
    }

    function defaultFont() {
        // AE 25.1以降では日本語用システム既定フォントを取得できる。
        try {
            if (app.fonts && app.fonts.getDefaultFontForCTScript && typeof CTScript !== "undefined") {
                return app.fonts.getDefaultFontForCTScript(CTScript.CT_JAPANESE_SCRIPT).postScriptName;
            }
        } catch (error) {}
        return "Helvetica";
    }

    function chooseFont(candidates, context, layerDefaultFont) {
        var i;
        for (i = 0; i < candidates.length; i++) {
            if (fontExists(candidates[i])) return candidates[i];
        }
        var fallback = layerDefaultFont || defaultFont();
        logWarning(context + ": フォントが見つからないため " + fallback + " を使用");
        return fallback;
    }

    function getOrCreateComp() {
        var active = app.project.activeItem;
        var maxOut = 540;
        var i;
        for (i = 0; i < DATA.length; i++) maxOut = Math.max(maxOut, tcToSeconds(DATA[i].tc_out));
        if (active && active instanceof CompItem) {
            if (active.duration < maxOut) {
                logWarning("アクティブコンポ尺を最終TC " + DATA[DATA.length - 1].tc_out + " まで延長しました");
                active.duration = maxOut;
            }
            return active;
        }
        logWarning("アクティブコンポがないためEP01_Telopsを新規作成しました");
        return app.project.items.addComp("EP01_Telops", 1920, 1080, 1, maxOut, FPS);
    }

    function setTemporalEase(property, keyIndex, easeIn, easeOut) {
        try {
            property.setTemporalEaseAtKey(keyIndex, [new KeyframeEase(0, easeIn)], [new KeyframeEase(0, easeOut)]);
        } catch (error) {}
    }

    function addOpacityFade(layer, fadeInFrames, fadeOutFrames) {
        var opacity = layer.property("ADBE Transform Group").property("ADBE Opacity");
        var fadeInEnd = Math.min(layer.outPoint, layer.inPoint + frameTime(fadeInFrames));
        var fadeOutStart = Math.max(fadeInEnd, layer.outPoint - frameTime(fadeOutFrames));
        opacity.setValueAtTime(layer.inPoint, 0);
        opacity.setValueAtTime(fadeInEnd, 100);
        opacity.setValueAtTime(fadeOutStart, 100);
        opacity.setValueAtTime(layer.outPoint, 0);
    }

    function addS2CharacterFade(layer, text) {
        // Animatorの不透明度を0にし、Range SelectorのOffsetを動かして文字単位で開示する。
        var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
        var animator = animators.addProperty("ADBE Text Animator");
        animator.name = "S2_2F_Per_Character";
        var props = animator.property("ADBE Text Animator Properties");
        props.addProperty("ADBE Text Opacity").setValue(0);
        var selector = animator.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        var offset = selector.property("ADBE Text Percent Offset");
        var characterCount = text.replace(/[\r\n]/g, "").length;
        var revealEnd = Math.min(layer.outPoint - frameTime(6), layer.inPoint + Math.max(1, characterCount) * frameTime(2));
        // Offset 0では全文字がOpacity 0の範囲内、100で範囲が文字列の
        // 後方へ抜けるため、左から右へ順番に表示される。
        offset.setValueAtTime(layer.inPoint, 0);
        offset.setValueAtTime(Math.max(layer.inPoint, revealEnd), 100);

        // カット尻6Fはレイヤー全体をフェードアウト。
        var opacity = layer.property("ADBE Transform Group").property("ADBE Opacity");
        opacity.setValueAtTime(Math.max(layer.inPoint, layer.outPoint - frameTime(6)), 100);
        opacity.setValueAtTime(layer.outPoint, 0);
    }

    function addS6Motion(layer) {
        var transform = layer.property("ADBE Transform Group");
        var scale = transform.property("ADBE Scale");
        scale.setValueAtTime(layer.inPoint, [110, 110]);
        scale.setValueAtTime(Math.min(layer.outPoint, layer.inPoint + frameTime(5)), [100, 100]);
        if (scale.numKeys >= 2) setTemporalEase(scale, 2, 75, 75);
        var position = transform.property("ADBE Position");
        position.expression = "time < inPoint + thisComp.frameDuration * 2 ? wiggle(12, 8) : value";
    }

    function addMarker(layer, comment) {
        var marker = new MarkerValue(comment || "（モーション指定なし）");
        layer.property("ADBE Marker").setValueAtTime(layer.inPoint, marker);
    }

    function styleS5Digits(sourceProp, doc, digitFont, digitSize) {
        // AE 2025のCharacterRange APIで数字だけフォントとサイズを変更する。
        var i = 0;
        var start;
        while (i < doc.text.length) {
            if (/[0-9０-９¥￥%％,.]/.test(doc.text.charAt(i))) {
                start = i;
                while (i < doc.text.length && /[0-9０-９¥￥%％,.]/.test(doc.text.charAt(i))) i++;
                try {
                    doc.characterRange(start, i).font = digitFont;
                    doc.characterRange(start, i).fontSize = digitSize;
                } catch (error) {
                    logWarning("S5数字部分の個別書式を適用できませんでした: " + error.toString());
                }
            } else {
                i++;
            }
        }
        sourceProp.setValue(doc);
    }

    function createLayer(comp, item, telop) {
        var cfg = STYLES[telop.style];
        var layer = comp.layers.addText(telop.text);
        var source = layer.property("ADBE Text Properties").property("ADBE Text Document");
        var doc = source.value;
        var layerDefaultFont = doc.font;
        var font = chooseFont(cfg.fonts, item.cut + "_" + telop.style, layerDefaultFont);
        var inTime = tcToSeconds(item.tc_in);
        var outTime = tcToSeconds(item.tc_out);

        doc.resetCharStyle();
        doc.resetParagraphStyle();
        doc.text = telop.text;
        doc.font = font;
        // S2は表示本文が26字を超えたときだけ64pxへ縮小する。
        doc.fontSize = telop.style === "S2" && telop.text.replace(/[\r\n]/g, "").length > 26 ? cfg.longSize : cfg.size;
        doc.fillColor = cfg.color;
        doc.applyFill = true;
        doc.tracking = cfg.tracking;
        doc.justification = ParagraphJustification.CENTER_JUSTIFY;
        if (telop.style === "S6") {
            doc.applyStroke = true;
            doc.strokeColor = [1, 0.843, 0];
            doc.strokeWidth = 6;
            doc.strokeOverFill = false;
        }
        source.setValue(doc);

        if (telop.style === "S5") {
            var digitFont = chooseFont(cfg.digitFonts, item.cut + "_S5数字", layerDefaultFont);
            doc = source.value;
            styleS5Digits(source, doc, digitFont, cfg.digitSize);
        }

        layer.name = item.cut + "_" + telop.style + "_" + telop.text.substring(0, 8).replace(/[\r\n]/g, " ");
        layer.label = cfg.label;
        // startTimeは動かさず、レイヤーの使用区間だけをトリミングする。
        layer.inPoint = inTime;
        layer.outPoint = outTime;
        var basePosition = POSITIONS[telop.layout.pos] || POSITIONS.center;
        layer.property("ADBE Transform Group").property("ADBE Position").setValue([
            basePosition[0] + telop.layout.offset[0],
            basePosition[1] + telop.layout.offset[1]
        ]);
        addMarker(layer, telop.motion);

        if (telop.style === "S2") addS2CharacterFade(layer, telop.text);
        else if (telop.style === "S3") addOpacityFade(layer, 12, 12);
        else if (telop.style === "S4") addOpacityFade(layer, 10, 10);
        else if (telop.style === "S6") addS6Motion(layer);
        // S5は仕様どおり静的配置。カウントアップなどはマーカーを見て手動調整する。

        // 自動改行・縮小はせず、セーフ幅を超えた事実だけを編集者へ知らせる。
        try {
            var bounds = layer.sourceRectAtTime(inTime, false);
            if (bounds.width > 1760) {
                logWarning(layer.name + ": テキスト幅 " + Math.round(bounds.width) + "px が1760pxを超過");
            }
        } catch (measureError) {
            logWarning(layer.name + ": テキスト幅を測定できませんでした: " + measureError.toString());
        }
        return layer;
    }

    app.beginUndoGroup("『なんだろう』テロップ自動配置");
    try {
        if (!app.project) app.newProject();
        var comp = getOrCreateComp();
        var i, j, item, telop;
        for (i = 0; i < DATA.length; i++) {
            item = DATA[i];
            for (j = 0; j < item.telops.length; j++) {
                telop = item.telops[j];
                if (telop.style === "S1") {
                    skipped++;
                    continue;
                }
                if (!STYLES[telop.style]) {
                    skipped++;
                    logWarning(item.cut + ": 未対応style " + telop.style);
                    continue;
                }
                try {
                    createLayer(comp, item, telop);
                    placed++;
                } catch (layerError) {
                    skipped++;
                    logWarning(item.cut + "_" + telop.style + ": 配置失敗: " + layerError.toString());
                }
            }
        }
    } catch (fatalError) {
        logWarning("処理中断: " + fatalError.toString());
    } finally {
        app.endUndoGroup();
    }
    alert("テロップ配置完了\n配置: " + placed + "レイヤー\nスキップ: " + skipped + "件\n警告: " + warnings.length + "件\n\n詳細は JavaScript Console を確認してください。");
}());
'''


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="テロップJSONを埋め込んだAE用jsxを生成")
    parser.add_argument("input", type=Path, help="ep01_telops.json")
    parser.add_argument("--output", type=Path, default=Path("generate_ae_layers.jsx"))
    parser.add_argument("--cuts", help="対象カット範囲（例: C01-C10、単独ならC06）")
    parser.add_argument("--check", action="store_true", help="JSXを書き出さず、配置上の要確認箇所をMarkdown表で表示")
    return parser.parse_args()


def tc_seconds(value: str) -> float:
    match = re.fullmatch(r"(\d+):(\d{2}):(\d{2}(?:\.\d+)?)", value)
    if not match:
        raise ValueError(f"TC形式が不正: {value!r}")
    h, m, s = match.groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def filter_cut_range(data: Any, specification: str | None) -> Any:
    """C01-C10のような指定で、検証・埋め込み対象そのものを絞る。"""
    if not specification:
        return data
    match = CUT_RANGE_RE.fullmatch(specification.strip())
    if not match:
        raise ValueError(f"--cuts形式が不正です: {specification!r}（例: C01-C10）")
    start_prefix, start_number, end_prefix, end_number = match.groups()
    end_prefix = end_prefix or start_prefix
    end_number = end_number or start_number
    if start_prefix.upper() != end_prefix.upper():
        raise ValueError("--cutsの開始と終了は同じ接頭辞にしてください")
    start, end = int(start_number), int(end_number)
    if start > end:
        raise ValueError("--cutsの開始番号は終了番号以下にしてください")
    wanted_prefix = start_prefix.upper()
    selected = []
    for item in data if isinstance(data, list) else []:
        cut_match = re.fullmatch(r"([A-Za-z]+)(\d+)", str(item.get("cut", ""))) if isinstance(item, dict) else None
        if cut_match and cut_match.group(1).upper() == wanted_prefix and start <= int(cut_match.group(2)) <= end:
            selected.append(item)
    if not selected:
        raise ValueError(f"--cuts {specification!r} に該当するカットがありません")
    return selected


def remove_production_note(cut: str, style: str, value: str, logs: list[str]) -> str:
    """許可リストにある末尾の丸括弧注記だけを除去する。"""
    cleaned = value.rstrip()
    # 将来、注記が連続した場合にも対応できるよう、末尾から繰り返し除く。
    while True:
        removed = None
        for note in PRODUCTION_NOTE_WHITELIST:
            suffix = f"({note})"
            if cleaned.endswith(suffix):
                removed = suffix
                cleaned = cleaned[: -len(suffix)].rstrip()
                logs.append(f"{cut} {style}: 末尾の制作注記を除去: {removed}")
                break
        if removed is None:
            return cleaned


def parse_motion_tags(cut: str, motion: str, warnings: list[str]) -> dict[str, Any]:
    """Q列由来の角括弧タグを読み、AE配置用の値へ変換する。"""
    layout: dict[str, Any] = {
        "pos": "center",
        "offset": [0, 0],
        "maxchar": None,
        "pos_explicit": False,
        "offset_explicit": False,
    }
    for match in MOTION_TAG_RE.finditer(motion):
        key, raw_value = match.group(1), match.group(2).strip()
        if key == "pos":
            value = raw_value.lower()
            if value not in VALID_POSITIONS:
                warnings.append(f"{cut}: 不正なposタグ {raw_value!r}")
            else:
                layout["pos"] = value
                layout["pos_explicit"] = True
        elif key == "maxchar":
            try:
                value = int(raw_value)
                if value <= 0:
                    raise ValueError
                layout["maxchar"] = value
            except ValueError:
                warnings.append(f"{cut}: maxcharは正の整数で指定してください: {raw_value!r}")
        elif key == "offset":
            values = [part.strip() for part in raw_value.split(",")]
            try:
                if len(values) != 2:
                    raise ValueError
                x, y = float(values[0]), float(values[1])
                layout["offset"] = [int(x) if x.is_integer() else x, int(y) if y.is_integer() else y]
                layout["offset_explicit"] = True
            except ValueError:
                warnings.append(f"{cut}: offsetはx,y形式の数値で指定してください: {raw_value!r}")
    return layout


def choose_line_break(value: str, limit: int) -> int:
    """上限以前で、句読点→接続助詞→文字数上限の順に改行点を選ぶ。"""
    window = value[:limit]
    punctuation = [index + 1 for index, char in enumerate(window) if char in "。、"]
    if punctuation:
        return punctuation[-1]
    particles = [
        index + len(particle)
        for particle in BREAK_PARTICLES
        for index in range(len(window))
        if window.startswith(particle, index) and index + len(particle) <= limit
    ]
    # 極端に短い行を避け、後半にある助詞を優先する。
    useful = [position for position in particles if position >= max(1, limit // 2)]
    return max(useful, default=limit)


def wrap_telop_text(value: str, maxchar: int | None) -> str:
    """既存改行を尊重しつつ、各行をmaxchar以内へ折り返す。"""
    if not maxchar:
        return value
    output: list[str] = []
    for original_line in re.split(r"\r\n|\r|\n", value):
        remaining = original_line
        while len(remaining) > maxchar:
            position = choose_line_break(remaining, maxchar)
            output.append(remaining[:position].rstrip())
            remaining = remaining[position:].lstrip()
        output.append(remaining)
    # AEのTextDocumentではCRを段落改行として扱う。
    return "\r".join(output)


def extract_repaired_text(fragment: str, style: str) -> str:
    """制作指示から引用符内を優先して、別テロップの仮本文を取り出す。"""
    quoted = QUOTED_RE.findall(fragment)
    if quoted:
        return " / ".join(quoted)
    cleaned = STYLE_IN_TEXT_RE.sub("", fragment)
    cleaned = re.sub(r"^(字幕で?|字幕|小テロップ|線ラベル)\s*", "", cleaned)
    return cleaned.strip(" ()（）/、。") or "要確認"


def repair_plus_telops(cut: str, telop: dict[str, Any], warnings: list[str]) -> list[dict[str, str]]:
    """`本文+指示S5`を元テロップと推定テロップへ分割する。"""
    raw_text = str(telop.get("text", "")).strip()
    raw_codes = STYLE_IN_TEXT_RE.findall(raw_text)
    if raw_codes:
        warnings.append(f"{cut} {telop.get('style', '')}: text内にコード文字列混入: {', '.join(raw_codes)} / {raw_text!r}")
    parts = raw_text.split("+")
    base = {"style": str(telop.get("style", "")), "text": parts[0].strip(), "motion": str(telop.get("motion", ""))}
    result = [base]

    # `S5/本文。S1字幕併走`のように「+」すらない末尾指定も、異なる
    # スタイルコードなら本文から切り離す。同じstyleの語は説明文の可能性が
    # 高いので警告だけに留め、勝手に分割しない。
    embedded = [m for m in STYLE_IN_TEXT_RE.finditer(base["text"]) if m.group(1) != base["style"]]
    if embedded:
        marker = embedded[0]
        fragment = base["text"][marker.start() :]
        base["text"] = base["text"][: marker.start()].rstrip(" +。")
        embedded_style = marker.group(1)
        repaired_text = extract_repaired_text(fragment, embedded_style)
        result.append({"style": embedded_style, "text": repaired_text, "motion": f"自動分割（要確認）: {fragment} / {base['motion']}"})
        warnings.append(f"{cut}: text内の{embedded_style}指定を別テロップへ自動分割: {repaired_text!r}")
    for fragment in parts[1:]:
        found = STYLE_IN_TEXT_RE.search(fragment)
        if not found:
            # +4pxのような単なる注記は本文へ戻す。
            base["text"] += "+" + fragment
            continue
        style = found.group(1)
        repaired_text = extract_repaired_text(fragment, style)
        result.append({"style": style, "text": repaired_text, "motion": f"自動分割（要確認）: {fragment.strip()} / {base['motion']}"})
        warnings.append(f"{cut}: '+'混入を{style}別テロップへ自動分割: {repaired_text!r}")
    return result


def validate_and_repair(data: Any) -> tuple[list[dict[str, Any]], list[str], list[str], int]:
    if not isinstance(data, list):
        raise ValueError("JSON最上位は配列である必要があります")
    warnings: list[str] = []
    logs: list[str] = []
    repaired: list[dict[str, Any]] = []
    skipped_s1 = 0
    for index, item in enumerate(data):
        if not isinstance(item, dict):
            warnings.append(f"index {index}: カットがオブジェクトではないため除外")
            continue
        cut = str(item.get("cut", f"index {index}"))
        tc_in, tc_out = str(item.get("tc_in", "")), str(item.get("tc_out", ""))
        try:
            if tc_seconds(tc_in) >= tc_seconds(tc_out):
                warnings.append(f"{cut}: tc_in >= tc_out ({tc_in} / {tc_out})")
        except ValueError as exc:
            warnings.append(f"{cut}: {exc}")
        out_telops: list[dict[str, Any]] = []
        for telop in item.get("telops", []):
            if not isinstance(telop, dict):
                warnings.append(f"{cut}: telopがオブジェクトではないため除外")
                continue
            candidates = repair_plus_telops(cut, telop, warnings)
            for candidate in candidates:
                style, body = candidate["style"], candidate["text"]
                candidate["text"] = remove_production_note(cut, style, body, logs)
                layout = parse_motion_tags(cut, candidate["motion"], warnings)
                maxchar = layout["maxchar"] if layout["maxchar"] is not None else DEFAULT_MAXCHARS.get(style)
                original_text = candidate["text"]
                candidate["text"] = wrap_telop_text(original_text, maxchar)
                layout["maxchar"] = maxchar
                candidate["layout"] = layout
                if candidate["text"] != original_text:
                    logs.append(f"{cut} {style}: maxchar={maxchar}で自動改行")
                if style not in VALID_STYLES:
                    warnings.append(f"{cut}: 不正なstyle {style!r}")
                if style == "S1":
                    skipped_s1 += 1
                out_telops.append(candidate)

        # AE対象の2件目以降は、posとoffsetがどちらも未指定なら120pxずつ
        # 下へ逃がす。S1はPremiere処理なので件数に含めない。
        target_index = 0
        for candidate in out_telops:
            if candidate["style"] not in VALID_STYLES - {"S1"}:
                continue
            layout = candidate["layout"]
            if target_index > 0 and not layout["pos_explicit"] and not layout["offset_explicit"]:
                layout["offset"][1] += 120 * target_index
                logs.append(f"{cut} {candidate['style']}: 複数テロップ回避offset y={layout['offset'][1]}pxを自動設定")
            target_index += 1
        repaired.append({"cut": cut, "part": str(item.get("part", "")), "tc_in": tc_in, "tc_out": tc_out, "telops": out_telops})
    return repaired, warnings, logs, skipped_s1


def js_literal(data: list[dict[str, Any]]) -> str:
    # JSON配列はJavaScriptの配列/オブジェクトリテラルとしても有効。
    # U+2028/U+2029は古いJSエンジンで改行扱いになるため明示的にエスケープする。
    return json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def estimated_line_width(style: str, value: str, full_text: str) -> float:
    """AEなしで、フォントサイズとtrackingから1行の幅を安全側に概算する。"""
    metric = STYLE_WIDTH_METRICS.get(style)
    if not metric:
        return 0.0
    size = metric["size"]
    if style == "S2" and len(re.sub(r"[\r\n]", "", full_text)) > 26:
        size = metric["long_size"]
    factors = []
    for char in value:
        if char.isspace():
            factors.append(0.35)
        elif ord(char) < 128:
            factors.append(0.6)
        else:
            factors.append(1.0)
    glyph_width = sum(factors) * size
    tracking_width = max(0, len(value) - 1) * size * metric["tracking"] / 1000
    return glyph_width + tracking_width


def check_rows(data: list[dict[str, Any]]) -> list[tuple[str, str, str]]:
    """ドライランで報告する3種類の問題を抽出する。"""
    rows: list[tuple[str, str, str]] = []
    seen: set[tuple[str, str]] = set()

    def add(cut: str, value: str, reason: str) -> None:
        plain = re.sub(r"[\r\n]", "", value)[:20] or "（空）"
        key = (cut, reason)
        if key not in seen:
            seen.add(key)
            rows.append((cut, plain, reason))

    for item in data:
        cut = item["cut"]
        targets = [telop for telop in item["telops"] if telop["style"] in VALID_STYLES - {"S1"}]
        for telop in targets:
            widths = [estimated_line_width(telop["style"], line, telop["text"]) for line in re.split(r"[\r\n]", telop["text"])]
            estimated = max(widths, default=0)
            if estimated > 1760:
                maxchar = telop["layout"].get("maxchar")
                add(cut, telop["text"], f"改行後も推定幅{estimated:.0f}px（maxchar={maxchar or '未指定'}）")

            if POSITION_WORD_RE.search(telop["motion"]) and not telop["layout"]["pos_explicit"]:
                word = POSITION_WORD_RE.search(telop["motion"]).group(0)
                add(cut, telop["text"], f"Q列に位置表現「{word}」があるが[pos:]未指定")

        if len(targets) > 1:
            affected = [telop for telop in targets[1:] if not telop["layout"]["pos_explicit"] and not telop["layout"]["offset_explicit"]]
            if affected:
                add(cut, affected[0]["text"], f"S2〜S6が{len(targets)}件、未指定の2件目以降へ自動y+120px")
    return rows


def print_check_table(data: list[dict[str, Any]]) -> None:
    """検出結果だけをMarkdownテーブルとして標準出力へ出す。"""
    rows = check_rows(data)
    print("| カット番号 | 該当テキスト先頭20字 | 検出理由 |")
    print("|---|---|---|")
    if not rows:
        print("| — | — | 該当なし |")
        return
    for cut, value, reason in rows:
        safe_value = value.replace("|", "\\|")
        safe_reason = reason.replace("|", "\\|")
        print(f"| {cut} | {safe_value} | {safe_reason} |")


def main() -> int:
    args = parse_args()
    try:
        source = json.loads(args.input.read_text(encoding="utf-8"))
        source = filter_cut_range(source, args.cuts)
        data, warnings, logs, skipped_s1 = validate_and_repair(source)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"エラー: {exc}")
        return 1

    if args.check:
        print_check_table(data)
        return 0

    jsx = JSX_TEMPLATE.replace("__TELOP_DATA__", js_literal(data), 1)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    # utf-8-sigはファイル先頭へBOM(EF BB BF)を付ける。日本語版AEでの
    # ExtendScript読み込み時に文字コードを誤判定されるリスクを下げる。
    args.output.write_text(jsx, encoding="utf-8-sig")
    target_count = sum(1 for item in data for t in item["telops"] if t["style"] in VALID_STYLES - {"S1"})
    max_out = max((tc_seconds(item["tc_out"]) for item in data), default=0)

    print("=== build_jsx バリデーション結果 ===")
    print(f"入力カット数: {len(data)}")
    print(f"AE配置対象(S2〜S6): {target_count}")
    print(f"S1スキップ: {skipped_s1}")
    print(f"最終TC: {max_out:.3f}秒")
    if max_out > 540:
        warnings.append(f"最終TCが新規コンポ基準9分を{max_out - 540:.3f}秒超過（jsx側で自動延長）")
    print(f"警告数: {len(warnings)}")
    for warning in warnings:
        print(f"警告: {warning}")
    print(f"制作注記除去数: {len(logs)}")
    for message in logs:
        print(f"情報: {message}")
    print(f"出力: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
