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
FPS = 23.976

# TelopOverlay.tsx の表示アルゴリズムと必ず一致させる定数(2026-07-14制定)。
# 「読める時間」を先に確保し、足りなければ表示開始を早める。それでも
# 足りない場合はコンテのカット尺そのものが不足している(=報告対象)。
BASE_DELAY_F = 10   # 最初の文字が動き出すまでの助走
CHAR_STEP_F = 2      # 1文字ごとのずらし幅(S2)
EMPH_BEAT_F = 12     # 強調ランの手前に挿む「ため」
CHAR_FADE_F = 8       # 1文字がフェードインし切るまでの幅
QUOTE_BLOCKIN_F = 26  # S3(引用)は文字送りせず全体フェード
READ_CPS = 5.5          # 番組の可読速度基準(conte2srt.pyの--cpsと同一。ここを変えたら揃えること)
HOLD_ABS_MIN_F = 24      # 保持の絶対下限(ごく短い語でもこれより短くしない)


def hold_frames(text: str) -> int:
    """表示完了後、フェードアウト前に「くっきり静止して読める」時間(フレーム)。
    番組の可読速度基準(5.5文字/秒)を満たす長さを保証する。フェードで消えていく
    末尾10Fぶんは可読時間に数えない(保守的に見積もる)。"""
    read_f = round(len(text) / READ_CPS * FPS)
    return max(HOLD_ABS_MIN_F, read_f)


def char_emphasis_flags(text: str, emphasis: list[dict]) -> list[str | None]:
    """TSXのmarkEmphasisと同一ロジック: 後勝ちで色を割り当てる。"""
    flags: list[str | None] = [None] * len(text)
    for e in emphasis:
        word = e.get('text', '')
        if not word:
            continue
        idx = text.find(word)
        while idx >= 0:
            for k in range(idx, idx + len(word)):
                flags[k] = e.get('color', 'gold')
            idx = text.find(word, idx + len(word))
    return flags


def required_frames(style: str, text: str, emphasis: list[dict]) -> int:
    """このテロップが「読める」ために最低限必要なフレーム数(表示開始〜保持完了)。
    保持時間は番組の可読速度基準(5.5文字/秒)から算出する(2026-07-14修正:
    以前は根拠のない固定24Fを使っており、長い文が読み切る前にフェードしていた)。"""
    if style == 'S3':
        reveal_complete = QUOTE_BLOCKIN_F
    else:
        flags = char_emphasis_flags(text, emphasis)
        t = BASE_DELAY_F
        last_delay = t
        prev_emph = False
        for is_emph in (bool(f) for f in flags):
            if is_emph and not prev_emph:
                t += EMPH_BEAT_F  # 強調ランに入る手前でひと呼吸
            last_delay = t
            t += CHAR_STEP_F
            prev_emph = is_emph
        reveal_complete = last_delay + CHAR_FADE_F
    return reveal_complete + hold_frames(text)


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
    conflicts: list[dict] = []

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

        narration = str(row[3] or '').replace('★', '').replace('\n', '')
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
            # タイミングルール(2026-07-13): S2/S3はナレーション内で該当文が
            # 始まる位置(文字数比例)から出す。見つからなければカット頭から
            delay_sec = 0.0
            if style in ('S2', 'S3') and not tags.get('seq') and narration:
                idx = narration.find(text)
                if idx < 0:
                    idx = narration.find(text[:8])
                if idx > 0:
                    frac = idx / len(narration)
                    delay_sec = max(0.0, round(frac * (end_s - start_s) - 0.3, 2))

            # 表示尺フィットルール(2026-07-14制定): 「話される瞬間」から出すと
            # 読み切れない場合、表示開始を前倒しする。それでも足りなければ
            # カット尺そのものが不足しているのでconflictsに記録し、報告する。
            if style in ('S2', 'S3') and not tags.get('seq'):
                cut_frames = round((end_s - start_s) * FPS)
                need = required_frames(style, text, emphasis)
                naive_delay_f = round(delay_sec * FPS)
                available = cut_frames - naive_delay_f
                if available < need:
                    shift = need - available
                    new_delay_f = max(0, naive_delay_f - shift)
                    if cut_frames - new_delay_f < need:
                        conflicts.append({
                            'cut': no, 'text': text,
                            'cut_sec': round(end_s - start_s, 2),
                            'need_sec': round(need / FPS, 2),
                            'deficit_sec': round((need - cut_frames) / FPS, 2),
                        })
                        new_delay_f = 0
                    delay_sec = round(new_delay_f / FPS, 2)

            telops.append({
                **({'delaySec': delay_sec} if delay_sec > 0.2 else {}),
                'style': style,
                'text': text,
                'latin': latin,
                'emphasis': emphasis,
                'motion': motion,
                **{k: v for k, v in tags.items() if k in ('pos', 'offset', 'maxchar', 'seq')},
            })
        # seq:replace(差し替え表示)は等分でなく、各文が必要とするフレーム数の
        # 比率で配分する(2026-07-14制定)。均等割りだと長い/強調入りの文が
        # 尺不足で切れる(C08で実際に発生)。
        replace_group = [t for t in telops if t.get('seq') == 'replace']
        if replace_group:
            cut_frames = round((end_s - start_s) * FPS)
            needs = [required_frames(t['style'], t['text'], t['emphasis']) for t in replace_group]
            total_need = sum(needs)
            if total_need <= cut_frames:
                # 必要分を確保した上で、余りは比率配分
                slack = cut_frames - total_need
                weights = [n / total_need for n in needs] if total_need else needs
                seg_frames = [needs[i] + round(slack * weights[i]) for i in range(len(needs))]
            else:
                conflicts.append({
                    'cut': no, 'text': ' / '.join(t['text'] for t in replace_group),
                    'cut_sec': round(end_s - start_s, 2),
                    'need_sec': round(total_need / FPS, 2),
                    'deficit_sec': round((total_need - cut_frames) / FPS, 2),
                })
                seg_frames = [round(cut_frames * n / total_need) for n in needs]  # 比例縮小(best effort)
            for t, f in zip(replace_group, seg_frames):
                t['segFrames'] = max(1, f)

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

    if conflicts:
        print(f'\n⚠ 尺不足で表示しきれないテロップ: {len(conflicts)}件'
              '(カット先頭から出しても読み切れません。コンテのTC延長が必要です)')
        for cf in conflicts:
            print(
                f"  {cf['cut']}: 「{cf['text']}」"
                f" 現尺{cf['cut_sec']}秒 / 必要{cf['need_sec']}秒"
                f" (最低+{cf['deficit_sec']}秒 延長が必要)"
            )

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
