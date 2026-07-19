# ASSET_MANAGEMENT — 素材とアウトプットの格納・管理規約

**全AIと人間は、素材の生成・配置・書き出し前にこれに従う。** 目的は「どこに何があるか」を一意にし、
素材写真・完成物・レンダー出力・旧版がごちゃ混ぜになるのを止めること。
最終更新: 2026-07-19 / 関連: `MULTI_AGENT_PROTOCOL.md`(担当境界)/ `CANONICAL_SOURCES.md`

---

## 0. 大原則

1. **入力(素材)と出力(レンダー結果)を混ぜない。** 素材は `remotion_mg/public/`、レンダー結果は `out/`。
2. **out/ はgit管理外**(再生成できる)。素材は必要なものだけgit管理。
3. **1ファイル1役割・名前で役割が分かる。** 素材写真・完成物・生成AI生ファイルを同じ名前空間に置かない。
4. **迷ったら增やさず、既存の場所に従う。** 新しいフォルダを勝手に作らない(規約にない置き場が散らかりの元)。

---

## 1. ディレクトリの役割(どこに何を置くか)

| 置き場 | 何を | git |
|---|---|---|
| `remotion_mg/public/<cutID>/` | **カット別の入力素材**(写真・切り抜き・偽サムネ・音) | 管理 |
| `remotion_mg/public/textures/` | 共通テクスチャ(紙・コンクリ・ハーフトーン等) | 管理 |
| `remotion_mg/public/audio/` `sfx/` | 音声・SE | 管理(wavは.gitignore対象=別途共有) |
| `out/ep01/` `out/ep02/` | **レンダー結果**(透過MOV・mp4・背景PNG) | **管理外** |
| `out/qa/<cutID>/` | QA静止画 | **管理外** |
| `docs/design_reference/` | 設計・仕様・スタイルフレーム(HTML/md)。**素材PNGの本置き場ではない** | 管理 |
| `conte/` | コンテ(入力の起点) | 管理 |
| `tools/` | スクリプト | 管理 |
| `archive/` | 旧素材・旧実装の隔離(§4) | 管理 |

**禁止**: `remotion_mg/public/` の**直下**にファイルを直置きすること。必ず `public/<cutID>/` か共通フォルダ(textures/audio/sfx)へ。
(現状 public直下に散っている 参考画像・ロゴ・.mov は §5 の是正対象)

## 2. 素材の命名規約(public/<cutID>/ 内)

役割を接頭辞で分ける。**同じフォルダに違う役割を混ぜても、名前で判別できる**ようにする。

| 種別 | 命名 | 例 |
|---|---|---|
| 生成AI/撮影の**素材写真**(加工前) | `<cutID>_photo_<内容>.png` | `c01_photo_clock.png` |
| **切り抜き**(透過PNG化済み) | `<cutID>_cutout_<内容>.png` | `c01_cutout_woman.png` |
| **完成物**(文字入り偽サムネ等) | `<cutID>_thumb_NN.png` / `<cutID>_<用途>.png` | `C01_thumb_04.png` |
| **テクスチャ板** | `textures/collage/<種類>.jpg` | `textures/collage/concrete.jpg` |
| **参考画像**(制作の参照用・本編非使用) | `docs/design_reference/<用途>_review/` へ | eyecatch_review/ |

**Gemini等の生ファイル名は即リネームする。** `Gemini_Generated_Image_xxxx.png` のまま置かない
(何の素材か分からず、重複・迷子の温床)。生成したら上記命名へ改名してからコミット。

## 3. レンダー出力(out/)の書き出し規約

- カット単位: `out/ep01/<cutID>_<用途>.mov`(例 `out/ep01/C02_phone_punchin.mov`)
- 透過納品: ProRes4444 + 背景別出し(`out/ep01/bg_roomtone.png`)。詳細はパターンカタログ「納品規約」
- QA静止画: `out/qa/<cutID>/frameNN.png`
- **out/ はgit管理外**。共有が要る完成動画はPremiere側 or 別のファイル共有で。リポジトリに.mov/.mp4/.wavを載せない(.gitignore済み)
- **重い一括書き出しは事前申請**(MULTI_AGENT_PROTOCOL §4)

## 4. 古い素材・旧版の管理

- 差し替えた素材・旧実装は**消さずに `archive/` へ退避**(git履歴にも残るが、作業ツリーから見えなくする)
  - `archive/assets/<cutID>/` … 差し替え前の素材
  - `archive/ae_pipeline/` … 旧AE路線(既存)
- 旧版を現役と**同じフォルダに同名近くで並べない**。やむを得ず残すなら `_旧` / `_deprecated` を付ける
- **重複を作らない**: 同じ画像を public と docs 両方に置かない。参照用は docs、本編素材は public のどちらか一方に決める
  (現状の「アイキャッチ参考画像」は public直下と docs/eyecatch_review/ で重複 → docs側を正とし public直下を archive/ へ)
- 削除は**人間承認後**(MULTI_AGENT_PROTOCOL §9)。退避(移動)を基本とする

## 5. 現状の是正リスト(要・人間承認 / Codex実行想定)

破壊的操作を含むので、承認を得てから実施。削除でなく**移動(退避)**を基本とする。

1. `remotion_mg/public/.DS_Store` を削除 + `.gitignore` に `.DS_Store`(既にあれば重複排除)
2. public直下の参考画像4枚(`なんだろうアイキャッチ_参考画像2〜5.png`)→ `docs/design_reference/eyecatch_review/` と重複。**public直下ぶんを削除**(docs側が正)
3. public直下の `アイキャッチ最後の決まり画ロゴ.png` → 参照有無を確認し、使用中なら `public/ident/` へ、未使用なら archive/ へ
4. public直下の `.mov`(C04/C06)→ 素材動画。`public/<cutID>/` へ移動 or 巨大なら.gitignore+別共有を検討
5. `remotion_mg/public/c01/` の混在を命名で整理:
   - `Gemini_Generated_Image_*.png` → `c01_photo_<内容>.png` へリネーム(中身確認の上)
   - `C01_quiet_*` `c01_photo_*` = 素材写真(§2命名に沿っていればOK)
   - `C01_thumb_*` = 完成物(OK)
   - `ep01_main_woman_cutout.png` → `c01_cutout_woman.png` へ(命名統一)
6. 是正後 `CANONICAL_SOURCES.md` と本書の「現状」を更新

## 6. AIごとの素材まわりの担当(再掲・MULTI_AGENT_PROTOCOL §7)

- **Gemini**: 静止画生成 → `public/<cutID>/` に §2命名で保存(生ファイル名のまま置かない)
- **Codex**: 素材を使うRemotion実装・`out/` への書き出し(重い処理は申請)
- **Claude**: 素材の要否判断・命名規約の管理・是正リスト作成
- 破壊的整理(削除・移動)は人間承認後
