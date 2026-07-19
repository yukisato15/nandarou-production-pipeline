# CANONICAL_SOURCES — 正本インデックス

**全AI(Claude / ChatGPT / Codex / Gemini)と人間は、作業前に必ずこのファイルを見る。**
「どのファイルが最新の正本か」はここが唯一の答え。mainが常に最新とは限らない(下記)。
最終更新: 2026-07-19 / 更新責任: 正本を移動・昇格させたエージェントが同じPR内で本表を更新する。

---

## 0. 最重要の前提 — mainは"安定版"であって"最新版"ではない

制作中の最新成果物は、mainにマージされるまで**作業ブランチ / PR にしか存在しない**期間がある。
したがって「mainに無い＝存在しない」は**誤り**。必ず全リモートブランチとopen PRを確認する(§手順)。

## 1. 正本一覧(2026-07-19時点の実測)

| 対象 | 正本ファイル | 状態 | 参照先(ブランチ/PR) | 備考 |
|---|---|---|---|---|
| 第1回 コンテ | `conte/第1回_コンテ表_v2.xlsx` | **未マージ** | `docs/design-vox-montage-ep01v2`(PR #5)/ blob `69475f2` | 84カット・台本v2.1準拠。**これが正本** |
| 第1回 台本 | `docs/design_reference/第1回_台本_v2.1_草稿.md` | 未マージ | 同上 | v2.0は旧。最終稿は人間ゲート1未通過(草稿) |
| 第1回 コンテ(旧) | `conte/第1回_コンテ表_v1.xlsx` | main | `origin/main` | **旧版・比較参照専用**。新規制作では使わない |
| 第2回 コンテ | `conte/第2回_コンテ表_v1.xlsx` | main | `origin/main` | 現行正本 |
| ブランド定義 | `UnsaidWorks_ブランド定義_v1.1_確定版.md.docx` | main | `origin/main` | 最上位・不変 |
| チャンネル設計 | `チャンネル設計書_v4_確定版.md.docx` + 改訂記録v4.1/4.2/4.3/4.4 | 一部未マージ | v4.4は `docs/design-vox-montage-ep01v2` | 改訂記録は差分で上書き |
| デザイン/VOX | `docs/design_reference/MontageScene実装指示書_v1_VOX.md` ほか | 未マージ | `docs/design-vox-montage-ep01v2` | Remotionパターンカタログ・VOXテンプレ含む |
| Remotion実装 | `remotion_mg/`(進行中) | 分散 | `feature/c01-thumbnail-flythrough` / `agent/*` | 実装はブランチ横断で進行中。§3参照 |

## 2. 第1回で「v1かv2か」迷ったら

- 新規制作・Remotion実装・素材選定・カット内容の確認 → **必ずv2**(`conte/第1回_コンテ表_v2.xlsx`)
- v1は、ユーザーが明示的に「v1」と指定したとき、または新旧比較のときだけ
- v2はmain未マージ。mainのv1しか見えない環境では「mainにはv1しかない。v2は `docs/design-vox-montage-ep01v2` にある」と理解する

## 3. ブランチの役割(2026-07-19実測)

| ブランチ | 役割 | 最新 |
|---|---|---|
| `main` | 安定版。第1回はv1(旧) | c6563f5 |
| `docs/design-vox-montage-ep01v2` | **第1回v2の正本 + VOX設計 + PR #5** | 1b047e4 |
| `feature/c01-thumbnail-flythrough` | 旧統合ブランチ(v2は古い版) | 47cc9a9 |
| `agent/c15-mit-study-montage` | Gemini: C15モンタージュ | 8e73cb6 |
| `agent/remotion-current-snapshot` | Remotim実装スナップショット | ea82533 |
| `agent/project-context-share` | プロジェクト文書 | d81a4c2 |
| `chore/repo-reorg-v1` | リポジトリ整理 | 591deb1 |

## 4. 「ファイルが存在しない」と断定する前に(全AI必須)

以下を**すべて**確認するまで「存在しない」と言わない:
1. `git fetch --all` 後の `origin/main`
2. `git branch -r`(全リモートブランチ)
3. open PR 一覧
4. 該当しそうな過去コミット・リネーム/移動履歴
5. ファイル名の表記揺れ(v1/v2、全角/半角、_/スペース)

確認しきれていないときは断定形を使わず、**範囲を限定**して答える:
「mainでは確認できません」「取得できたブランチ内では見つかりません」。
✗「GitHub上に存在しません」「全ブランチにありません」(全確認していない断定は禁止)

## 5. 正本が変わったら(昇格・マージ時の手順)

- 正本を移動/昇格させたエージェントは、**同じPR内で本表を更新**する(旧正本→新正本・日付・参照先)
- v2がmainにマージされたら: 本表の「状態」をmainに更新し、v1を旧版として §archive 化(移動はユーザー承認後)
- 旧版は最新版と同じフォルダに同列で置かない(README明記 or `archive/` or ファイル名に`_旧`)
