#!/usr/bin/env python3
"""コンテ表(テロップ記法v2)→ TelopOverlay用JSON変換器。

使い方:
    python3 conte2telops.py 第1回_コンテ表_v1.xlsx remotion_mg/data/ep01_telops.json

方針:
- 記法v2を前提にした厳密パース。疑わしい入力は黙って直さずエラーで止める
  (事前に validate_telops.py を警告ゼロにしておくこと)
- オーバーレイ対象は S2/S3/S5 のみ。
  S1=Premiere SRT / S4=JsonScenesのstatement型 / S6=画像側 なので除外
- モーション列の [role:...] が付いた行は、MG・画像の内部で描かれるため除外
"""
import json
import re
import sys

import openpyxl

COL_NO, COL_PART, COL_TC = 1, 2, 3
COL_TELOP, COL_MOTION = 16, 17
OVERLAY_STYLES = {'S2', 'S3', 'S5'}
LINE_RE = re.compile(r'^(S[1-6])(\(欧文\))?/(.*)$')
EMPH_RE = re.compile(r'《(.+?)》')


def tc_to_sec(tc: str) -> float:
    parts = tc.strip().split(':')
    if len(parts) == 2:
        return int(parts[0]) * 60 + float(parts[1])
    return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])


def parse_tags(motion: str) -> dict:
    tags = {}
    m = re.search(r'\[pos:(center|left|right|top|bottom)\]', motion)
    if m:
        tags['pos'] = m.group(1)
    m = re.search(r'\[offset:\s*(-?\d+)\s*,\s*(-?\d+)\s*\]', motion)
    if m:
        tags['offset'] = [int(m.group(1)), int(m.group(2))]
    m = re.search(r'\[maxchar:(\d+)\]', motion)
    if m:
        tags['maxchar'] = int(m.group(1))
    if '[seq:順次]' in motion:
        tags['seq'] = 'replace' if 'フェードイン→アウト' in motion else 'stack'
    for word, effect in re.findall(r'\[emph:([^|\]]+)\|([^\]]*)\]', motion):
        tags.setdefault('emphasis', []).append(
            {'text': word, 'color': 'red' if '朱' in effect else 'gold'}
        )
    return tags


def main(src: str, dst: str) -> None:
    wb = openpyxl.load_workbook(src, read_only=True)
    ws = wb['コンテ']
    cuts = []
    parts: dict[str, dict] = {}

    for row in ws.iter_rows(min_row=2, values_only=True):
        no = row[COL_NO - 1]
        if not no:
            continue
        part = str(row[COL_PART - 1])
        tc = str(row[COL_TC - 1])
        start_s, end_s = (tc_to_sec(t) for t in tc.split('-'))
        p = parts.setdefault(part, {'startSec': start_s, 'endSec': end_s})
        p['startSec'] = min(p['startSec'], start_s)
        p['endSec'] = max(p['endSec'], end_s)

        p_lines = [l for l in str(row[COL_TELOP - 1] or '').split('\n') if l.strip()]
        q_raw = [l for l in str(row[COL_MOTION - 1] or '').split('\n') if l.strip()]
        # 〃 は直前と同じ
        q_lines: list[str] = []
        for q in q_raw:
            q_lines.append(q_lines[-1] if q.strip() == '〃' and q_lines else q)

        telops = []
        for i, line in enumerate(p_lines):
            m = LINE_RE.match(line)
            if not m:
                raise SystemExit(f'{no}: 記法v2でない行 → {line}(先にvalidate_telops.pyを通すこと)')
            style, latin, body = m.group(1), bool(m.group(2)), m.group(3)
            if style not in OVERLAY_STYLES:
                continue
            motion = q_lines[i] if i < len(q_lines) else (q_lines[0] if len(q_lines) == 1 else '')
            if len(q_lines) == 1 and len(p_lines) > 1:
                motion = q_lines[0]
            if re.search(r'\[role:[^\]]+\]', motion):
                continue  # MG・画像の内部で描画される
            tags = parse_tags(motion)
            # 《》=金茶。Q列の[emph:語|朱]=朱。同語はQ列の色が勝つ
            emphasis: list[dict] = [{'text': w, 'color': 'gold'} for w in EMPH_RE.findall(body)]
            for e in tags.get('emphasis', []):
                emphasis = [x for x in emphasis if x['text'] != e['text']]
                emphasis.append(e)
            text = EMPH_RE.sub(lambda mm: mm.group(1), body)
            telops.append({
                'style': style,
                'text': text,
                'latin': latin,
                'emphasis': emphasis,
                'motion': motion,
                **{k: v for k, v in tags.items() if k in ('pos', 'offset', 'maxchar', 'seq')},
            })
        if telops:
            cuts.append({
                'cut': str(no),
                'part': part,
                'startSec': start_s,
                'endSec': end_s,
                'telops': telops,
            })

    doc = {'version': 2, 'fps': 23.976, 'parts': parts, 'cuts': cuts}
    with open(dst, 'w') as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    n = sum(len(c['telops']) for c in cuts)
    print(f'✓ {dst}: {len(cuts)}カット / テロップ{n}本 / パート{sorted(parts)}')
    for c in cuts:
        for t in c['telops']:
            flags = ' '.join(
                filter(None, [t['style'], 'seq:' + t.get('seq', '') if t.get('seq') else '',
                              'pos:' + t.get('pos', '') if t.get('pos') else '',
                              '強調:' + '/'.join(f"{e['text']}({e['color']})" for e in t['emphasis'])
                              if t['emphasis'] else ''])
            )
            print(f"  {c['cut']} [{flags}] {t['text'][:34]}")


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(2)
    main(sys.argv[1], sys.argv[2])
