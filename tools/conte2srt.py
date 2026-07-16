#!/usr/bin/env python3
"""コンテ表からS1字幕(SRT)とテロップ情報(JSON)を生成する。"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

from openpyxl import load_workbook


REPO_ROOT = Path(__file__).resolve().parent.parent


REQUIRED_HEADERS = {
    "cut": "No",
    "part": "パート",
    "tc": "TC目安",
    "narration": "ナレーション(全文)",
    "telop": "テロップ(スタイル/内容)",
    "motion": "テロップモーション",
}
STYLE_RE = re.compile(r"(?<![A-Za-z0-9])(?P<style>S[1-6])(?:\([^\n/]*\))?/")
PARTICLE_BREAKS = ("には", "では", "とは", "から", "まで", "ので", "のに", "ても", "って", "は", "が", "を", "に", "で", "と", "へ", "も", "の")


@dataclass
class Cut:
    row: int
    cut: str
    part: str
    start: float
    end: float
    narration: str
    telops: list[dict[str, str]]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="コンテ表xlsxからSRT/JSONを生成します")
    parser.add_argument("input", type=Path, help="入力xlsx")
    parser.add_argument("--out-dir", type=Path, default=REPO_ROOT / "out")
    parser.add_argument("--fps", type=float, default=23.976)
    parser.add_argument("--cps", type=float, default=5.5, help="ナレーション文字数/秒")
    return parser.parse_args()


def text(value: object) -> str:
    return "" if value is None else str(value).strip()


def parse_tc(raw: str) -> tuple[float, float]:
    """`mm:ss-mm:ss`（分は60以上も可）を秒へ変換する。"""
    match = re.fullmatch(r"\s*(\d+):(\d{1,2}(?:\.\d+)?)\s*-\s*(\d+):(\d{1,2}(?:\.\d+)?)\s*", raw)
    if not match:
        raise ValueError(f"TC形式が不正です: {raw!r}")
    sm, ss, em, es = match.groups()
    if float(ss) >= 60 or float(es) >= 60:
        raise ValueError(f"TCの秒は60未満にしてください: {raw!r}")
    return int(sm) * 60 + float(ss), int(em) * 60 + float(es)


def clean_caption(value: str) -> str:
    # 制作メモ用の記号だけを除去し、意味を持つダッシュは残す。
    return re.sub(r"[《》★]", "", value).strip()


def parse_telops(raw: str, motion: str) -> tuple[list[dict[str, str]], list[str]]:
    """スタイル開始位置を手掛かりに、複合セルも複数テロップへ分ける。"""
    raw = raw.strip()
    if not raw:
        return [], []
    matches = list(STYLE_RE.finditer(raw))
    if not matches or raw[: matches[0].start()].strip(" +\n"):
        return [], [f"スタイルコード/本文を解析できません: {raw!r}"]

    result: list[dict[str, str]] = []
    warnings: list[str] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(raw)
        body = raw[match.end() : end].strip(" +\n")
        if not body:
            warnings.append(f"本文が空です: {match.group('style')}/")
            continue
        result.append({"style": match.group("style"), "text": clean_caption(body), "motion": motion})

    # 「+S1字幕」のようにスラッシュを欠く追記は自動補完せず警告する。
    remainder = STYLE_RE.sub("", raw)
    dangling = re.findall(r"(?:^|\+)\s*(S[1-6])(?:字幕|\([^)]*\))?(?!/)", remainder)
    if dangling:
        warnings.append("スラッシュ無しのスタイル指定があります: " + ", ".join(dangling))
    return result, warnings


def choose_break(value: str, limit: int) -> int:
    """limit以前で、読点→助詞→その他の順に自然な改行位置を探す。"""
    if len(value) <= limit:
        return len(value)
    comma = value.rfind("、", 1, limit)
    if comma >= max(1, limit // 2):
        return comma + 1
    candidates = [
        i + len(p)
        for p in PARTICLE_BREAKS
        for i in [value.rfind(p, 1, limit)]
        if i >= max(1, limit // 2) and i + len(p) <= limit
    ]
    return max(candidates, default=limit)


def natural_points(value: str) -> list[tuple[int, int]]:
    """(位置, 優先度)のリスト。優先度: 0=句点 1=読点 2=助詞。"""
    points: list[tuple[int, int]] = []
    for i, ch in enumerate(value):
        if ch == "。":
            points.append((i + 1, 0))
        elif ch == "、":
            points.append((i + 1, 1))
    for p in PARTICLE_BREAKS:
        start = 0
        while True:
            i = value.find(p, start)
            if i < 0:
                break
            points.append((i + len(p), 2))
            start = i + 1
    return points


def split_long_caption(value: str, max_chars: int = 48, min_piece: int = 10) -> list[str]:
    """1字幕48字(=2行×24字)以内へ、均等に近い自然な位置で分ける。

    改行・分割ルール(2026-07-13制定):
    - 端数の短い字幕(「しなかったからです」だけ等)を作らない。
      末尾がmin_piece未満になる分割は選ばず、残った場合は前の字幕へ結合する
    - 分割位置は句点>読点>助詞の優先で、各片が均等に近くなる点を選ぶ
    """
    value = clean_caption(value).replace("\r", "").replace("\n", "")
    pieces: list[str] = []
    while len(value) > max_chars:
        n_left = -(-len(value) // max_chars)  # 残りの想定分割数(切り上げ)
        target = len(value) / n_left
        candidates = [
            (pos, priority)
            for pos, priority in natural_points(value)
            if min_piece <= pos <= max_chars and len(value) - pos >= min_piece
        ]
        if candidates:
            # 優先度ボーナス付きで、目標長に近い位置を選ぶ
            cut = min(candidates, key=lambda t: abs(t[0] - target) + t[1] * 4)[0]
        else:
            cut = choose_break(value, max_chars)
        pieces.append(value[:cut].strip())
        value = value[cut:].strip()
    if value:
        if pieces and len(value) < min_piece and len(pieces[-1]) + len(value) <= max_chars + 4:
            pieces[-1] = pieces[-1] + value  # 端数は前の字幕へ結合
        else:
            pieces.append(value)
    return pieces


def wrap_caption(value: str, line_limit: int = 24) -> str:
    if len(value) <= line_limit:
        return value
    # 両方の行が上限内に収まる範囲だけを候補にする。
    lower = max(1, len(value) - line_limit)
    upper = min(line_limit, len(value) - 1)
    comma_candidates = [i + 1 for i, char in enumerate(value) if char == "、" and lower <= i + 1 <= upper]
    if comma_candidates:
        cut = min(comma_candidates, key=lambda pos: abs(pos - len(value) / 2))
    else:
        punctuation_candidates = [
            i + 1 for i, char in enumerate(value)
            if char in "。！？!?」』" and lower <= i + 1 <= upper
        ]
        particle_candidates = [
            i + len(particle)
            for particle in PARTICLE_BREAKS
            for i in range(len(value))
            if value.startswith(particle, i) and lower <= i + len(particle) <= upper
        ]
        candidates = punctuation_candidates or particle_candidates
        cut = min(candidates, key=lambda pos: abs(pos - len(value) / 2), default=upper)
    return value[:cut].rstrip() + "\n" + value[cut:].lstrip()


def srt_time(seconds: float) -> str:
    millis = max(0, round(seconds * 1000))
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def json_time(seconds: float) -> str:
    return srt_time(seconds).replace(",", ".")


def load_cuts(path: Path) -> tuple[list[Cut], list[str], int]:
    workbook = load_workbook(path, data_only=True, read_only=True)
    if "コンテ" not in workbook.sheetnames:
        raise ValueError('シート「コンテ」がありません')
    sheet = workbook["コンテ"]
    header = {text(cell.value): cell.column for cell in next(sheet.iter_rows(min_row=1, max_row=1)) if text(cell.value)}
    missing = [name for name in REQUIRED_HEADERS.values() if name not in header]
    if missing:
        raise ValueError("必須ヘッダーがありません: " + ", ".join(missing))

    cuts: list[Cut] = []
    warnings: list[str] = []
    narration_chars = 0
    for row in range(2, sheet.max_row + 1):
        get = lambda key: text(sheet.cell(row, header[REQUIRED_HEADERS[key]]).value)
        cut_no = get("cut")
        if not cut_no:
            continue
        try:
            start, end = parse_tc(get("tc"))
        except ValueError as exc:
            warnings.append(f"行{row} {cut_no}: {exc}")
            continue
        narration = clean_caption(get("narration"))
        narration_chars += len(narration.replace("\n", ""))
        telops, telop_warnings = parse_telops(get("telop"), get("motion"))
        warnings.extend(f"行{row} {cut_no}: {warning}" for warning in telop_warnings)
        cuts.append(Cut(row, cut_no, get("part"), start, end, narration, telops))
    return cuts, warnings, narration_chars


def validate(cuts: list[Cut], warnings: list[str], cps: float) -> None:
    previous: Cut | None = None
    for cut in cuts:
        if cut.end <= cut.start:
            warnings.append(f"行{cut.row} {cut.cut}: TCが逆転または尺0です ({json_time(cut.start)}-{json_time(cut.end)})")
        if previous and cut.start < previous.end:
            warnings.append(f"行{cut.row} {cut.cut}: 前カット{previous.cut}とTCが重複/逆転しています")
        duration = cut.end - cut.start
        required = len(cut.narration.replace("\n", "")) / cps
        if duration > 0 and required > duration * 1.2:
            warnings.append(f"行{cut.row} {cut.cut}: ナレーション所要{required:.2f}秒が尺{duration:.2f}秒を20%以上超過")
        previous = cut


def s1_text(telop_text: str, narration: str, telops: list[dict[str, str]]) -> str:
    # 記法v2の特殊値「全文」(旧「字幕全文」)はナレーション全文への参照として展開する。
    if telop_text == "全文" or telop_text.startswith("字幕全文"):
        # 重複禁止ルール(2026-07-13): 同カットのS2/S4テロップと同じ文は
        # S1字幕から除く(同じ文が画面に二重に出るのを防ぐ)
        base = narration
        for telop in telops:
            if telop["style"] in ("S2", "S4") and telop["text"]:
                base = base.replace(telop["text"], "")
        return base
    # 明示本文の後ろに付いた「+画面隅に…」等は字幕本文ではなく制作指示(旧記法互換)。
    return telop_text.split("+", 1)[0].strip()


def build_srt(cuts: list[Cut], fps: float) -> tuple[str, int]:
    entries: list[tuple[float, float, str]] = []
    gap = 2.0 / fps
    for cut in cuts:
        captions: list[str] = []
        for telop in cut.telops:
            if telop["style"] == "S1":
                captions.extend(split_long_caption(s1_text(telop["text"], cut.narration, cut.telops)))
        if not captions:
            continue
        usable = max(0.0, cut.end - cut.start - gap * (len(captions) - 1))
        weights = [max(1, len(caption.replace("\n", ""))) for caption in captions]
        cursor = cut.start
        for caption, weight in zip(captions, weights):
            duration = usable * weight / sum(weights)
            entries.append((cursor, cursor + duration, wrap_caption(caption)))
            cursor += duration + gap
    blocks = [f"{i}\n{srt_time(start)} --> {srt_time(end)}\n{caption}" for i, (start, end, caption) in enumerate(entries, 1)]
    return "\n\n".join(blocks) + ("\n" if blocks else ""), len(entries)


def main() -> int:
    args = parse_args()
    if args.fps <= 0 or args.cps <= 0:
        print("エラー: --fps と --cps は正数で指定してください", file=sys.stderr)
        return 2
    try:
        input_path = args.input if args.input.is_absolute() else REPO_ROOT / args.input
        cuts, warnings, narration_chars = load_cuts(input_path)
        validate(cuts, warnings, args.cps)
    except (OSError, ValueError) as exc:
        print(f"エラー: {exc}", file=sys.stderr)
        return 1

    srt, subtitle_count = build_srt(cuts, args.fps)
    payload = [{
        "cut": cut.cut, "part": cut.part,
        "tc_in": json_time(cut.start), "tc_out": json_time(cut.end),
        "telops": cut.telops,
    } for cut in cuts]
    args.out_dir.mkdir(parents=True, exist_ok=True)
    # 出力名は入力ファイル名から導出(第1回→ep01)。誤命名事故を防ぐ
    m = re.search(r"第(\d+)回", input_path.name)
    prefix = f"ep{int(m.group(1)):02d}" if m else input_path.stem
    out_dir = args.out_dir if args.out_dir.is_absolute() else REPO_ROOT / args.out_dir
    out_dir = out_dir / prefix
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / f"{prefix}_S1.srt").write_text(srt, encoding="utf-8")
    (out_dir / f"{prefix}_s1_cues.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    print("=== 検証レポート ===")
    print(f"カット数: {len(cuts)}")
    print(f"字幕数: {subtitle_count}")
    print(f"総ナレーション文字数: {narration_chars}")
    print(f"警告数: {len(warnings)}")
    for warning in warnings:
        print(f"警告: {warning}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
