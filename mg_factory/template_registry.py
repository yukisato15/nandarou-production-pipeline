"""MGテンプレートの実装状態と必須パラメータを一元管理する。

Excel→JSONとJSON→JSXの両方からこのモジュールを使うことで、片方だけ
テンプレート追加される事故を防ぐ。外部ライブラリなしで実行できるよう、
実運用で事故になりやすい型・件数・範囲を小さなvalidatorで確認する。
"""

from __future__ import annotations

from typing import Any


TEMPLATE_REGISTRY: dict[str, dict[str, Any]] = {
    "AE_CARD_STACK_THUMBNAIL": {"renderer": "typography", "required": ("cards", "card_size", "pop_frames")},
    "AE_CARD_FOCUS_DROP": {"renderer": "typography", "required": ("kicker", "headline", "drop_frames")},
    "AE_TITLE_EPISODE": {"renderer": "typography", "required": ("episode", "series", "title", "subtitle")},
    "DATA_BAR_WORD_GROWTH": {"renderer": "data", "required": ("title", "bars", "draw_frames", "conceptual")},
    "DATA_FLOW_THREE_STEP": {"renderer": "data", "required": ("title", "nodes", "reveal_frames", "statement")},
    "DATA_RESEARCH_STAT_CARD": {"renderer": "data", "required": ("kicker", "year", "value", "caption")},
    "DATA_LINE_COMPARE_TWO": {"renderer": "data", "required": ("title", "series", "draw_frames")},
    "AE_BLACK_DECLARATION": {"renderer": "typography", "required": ("text", "reuse_key", "fade_frames")},
    "DATA_REPLACE_ARROW_DIAGRAM": {"renderer": "data", "required": ("left", "right", "statement")},
    "UI_AD_FEED_SCROLL": {"renderer": "hybrid_ui", "required": ("service", "cards", "scroll_pixels", "scroll_frames")},
    "AE_INTERSTITIAL_SIMPLE": {"renderer": "typography", "required": ("text", "secondary", "background", "foreground")},
    "AE_DARK_STATEMENT": {"renderer": "typography", "required": ("text", "caption", "fade_frames")},
    "AE_PRICE_TAG_MULTIPLY": {"renderer": "footage_overlay", "required": ("background_mode", "tags", "pop_frames")},
    "AE_LIST_ON_AMBIENT_PLATE": {"renderer": "footage_overlay", "required": ("items", "reveal_frames", "background_mode")},
    "AE_BRAND_LOGO_ASSEMBLY": {"renderer": "typography", "required": ("series", "episode", "subtitle", "draw_frames")},
    "AE_NEXT_EPISODE_TITLE": {"renderer": "typography", "required": ("next_episode", "title", "question", "fade_frames")},
    "AE_END_CARD_CREDITS": {"renderer": "typography", "required": ("cards", "hold_frames", "crossfade_frames")},
}

IMPLEMENTED_TEMPLATES = frozenset(TEMPLATE_REGISTRY)


def _is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _required_mapping_items(
    cut_no: str,
    items: Any,
    item_name: str,
    required: tuple[str, ...],
    warnings: list[str],
) -> bool:
    if not isinstance(items, list) or not items:
        warnings.append(f"{cut_no}: {item_name}は1件以上の配列が必要です")
        return False
    for index, item in enumerate(items, 1):
        if not isinstance(item, dict):
            warnings.append(f"{cut_no}: {item_name}[{index}]はobjectにしてください")
            continue
        for key in required:
            if key not in item:
                warnings.append(f"{cut_no}: {item_name}[{index}]に{key!r}がありません")
    return True


def validate_cut(cut: dict[str, Any]) -> list[str]:
    """実装済みテンプレート1件を検証し、人が直せる警告文を返す。"""

    warnings: list[str] = []
    cut_no = str(cut.get("cut") or "(cut不明)")
    template = cut.get("template_id")
    spec = TEMPLATE_REGISTRY.get(template)
    if spec is None:
        return [f"{cut_no}: まだMG Factory未実装 {template}"]
    params = cut.get("params")
    if not isinstance(params, dict):
        return [f"{cut_no}: paramsはobjectにしてください"]
    for key in spec["required"]:
        if key not in params:
            warnings.append(f"{cut_no} {template}: 必須param {key!r} がありません")
    if warnings:
        return warnings

    if not isinstance(cut.get("duration_frames"), int) or cut["duration_frames"] <= 0:
        warnings.append(f"{cut_no}: duration_framesは1以上の整数が必要です")
    if isinstance(cut.get("in_frame"), int) and isinstance(cut.get("out_frame"), int):
        if cut["out_frame"] - cut["in_frame"] != cut.get("duration_frames"):
            warnings.append(f"{cut_no}: in/out frameとduration_framesが一致しません")

    if template == "AE_CARD_STACK_THUMBNAIL":
        _required_mapping_items(cut_no, params["cards"], "cards", ("headline", "x", "y", "delay"), warnings)
        if isinstance(params["cards"], list) and len(params["cards"]) < 3:
            warnings.append(f"{cut_no}: thumbnail cardsは3件以上を推奨します")
    elif template == "DATA_BAR_WORD_GROWTH":
        _required_mapping_items(cut_no, params["bars"], "bars", ("label", "value"), warnings)
        if params.get("conceptual") is not True:
            warnings.append(f"{cut_no}: 演出値の棒グラフにはconceptual=trueが必要です")
    elif template == "DATA_FLOW_THREE_STEP":
        _required_mapping_items(cut_no, params["nodes"], "nodes", ("icon", "label", "sub"), warnings)
        if isinstance(params["nodes"], list) and len(params["nodes"]) != 3:
            warnings.append(f"{cut_no}: three step flowのnodesは3件必要です")
        if not isinstance(params["reveal_frames"], list) or len(params["reveal_frames"]) != 3:
            warnings.append(f"{cut_no}: reveal_framesは3件必要です")
    elif template == "DATA_LINE_COMPARE_TWO":
        if not isinstance(params["series"], list) or len(params["series"]) != 2:
            warnings.append(f"{cut_no}: line compareのseriesは2件必要です")
    elif template == "UI_AD_FEED_SCROLL":
        _required_mapping_items(cut_no, params["cards"], "cards", ("brand", "headline", "body", "is_fictional"), warnings)
        if isinstance(params["cards"], list) and any(card.get("is_fictional") is not True for card in params["cards"] if isinstance(card, dict)):
            warnings.append(f"{cut_no}: 全feed cardにis_fictional=trueが必要です")
    elif template == "AE_PRICE_TAG_MULTIPLY":
        _required_mapping_items(cut_no, params["tags"], "tags", ("label", "price", "x", "y", "delay"), warnings)
        for index, tag in enumerate(params["tags"] if isinstance(params["tags"], list) else [], 1):
            if not isinstance(tag, dict):
                continue
            for axis in ("x", "y"):
                value = tag.get(axis)
                if not _is_number(value) or not 0 <= value <= 1:
                    warnings.append(f"{cut_no}: tags[{index}].{axis}は0〜1の数値にしてください")
    elif template == "AE_LIST_ON_AMBIENT_PLATE":
        _required_mapping_items(cut_no, params["items"], "items", ("head", "body"), warnings)
        if not isinstance(params["reveal_frames"], list):
            warnings.append(f"{cut_no}: reveal_framesは配列にしてください")
        elif isinstance(params["items"], list) and len(params["items"]) != len(params["reveal_frames"]):
            warnings.append(f"{cut_no}: itemsとreveal_framesの件数を合わせてください")
    elif template == "AE_END_CARD_CREDITS":
        _required_mapping_items(cut_no, params["cards"], "cards", ("kind", "text"), warnings)

    return warnings


def validate_payload_cuts(cuts: list[dict[str, Any]]) -> list[str]:
    warnings: list[str] = []
    seen: set[str] = set()
    for cut in cuts:
        cut_no = str(cut.get("cut") or "")
        if cut_no in seen:
            warnings.append(f"{cut_no}: cut番号が重複しています")
        seen.add(cut_no)
        if cut.get("template_id") in IMPLEMENTED_TEMPLATES:
            warnings.extend(validate_cut(cut))
    return warnings
