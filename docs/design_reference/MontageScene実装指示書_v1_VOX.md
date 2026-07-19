# MontageScene 実装指示書 v1(VOX写真モンタージュ基盤)

2026-07-18 / 承認: Yuki(VOXテンプレA〜D方向で承認)
狙い: **生成AI動画(Runway/Gemini)への依存を減らし、静止写真+少数の実写(波・煙・群衆)を
コード側でクロップ・グレード・移動・合成して"映像"にする。** これがこの回以降の主力エンジン。
上位: `資料モンタージュ設計_v1.md`(設計)→ 本書(VOX品質での実装確定)。AGENTS.md §4/§5に従う。

## 0. 思想(なぜ写真モンタージュか)

- 生成AI動画は歴史・抽象に強いが、高コスト・不安定・"それっぽい嘘"になりやすい
- 静止写真(PD/自撮り/ストック)は正確・安価・権利が明快。**足りないのは「動き」だけ**
- Remotionは動きを与えられる: Ken Burns(緩速ズーム/パン)、視差、切り抜きスライド、波動画の合成、グレイン
- → **写真を主役に、実写は"質感の下地"(波・煙・光)として少量。生成AIは最後の手段**

## 1. theme.ts への追加

```ts
// 追加トークン
amber: '#E8A33D',        // 数字ハイライト(明るい写真上で金茶が沈むため)
// グレードプリセット(全面写真を番組ルックへ馴染ませる。CSS filter相当)
grade: {
  archive:  { grayscale: .75, contrast: 1.15, brightness: .72, sepia: .12 },
  quote:    { grayscale: .90, contrast: 1.20, brightness: .50, sepia: .10 },
  evidence: { grayscale: .60, contrast: 1.10, brightness: .85, sepia: .05 }, // 資料写真・軽め
  footage:  { grayscale: .55, contrast: 1.08, brightness: .78, sepia: .08 }, // 波・煙など実写
},
kenBurns: { // 標準の緩速カメラ(Ken Burns)。数値=1カット内の変化量
  slowIn:  { scaleFrom: 1.0,  scaleTo: 1.08, panX: 0,   panY: -20 }, // 静かに寄る
  slowOut: { scaleFrom: 1.08, scaleTo: 1.0,  panX: 0,   panY: 0   }, // 引く
  driftL:  { scaleFrom: 1.06, scaleTo: 1.06, panX: 40,  panY: 0   }, // 横移動
},
```
既存トークン(paper/ink/gold/red/mincho/Oswald)は変更しない。

## 2. MontageScene コンポジション

- `src/compositions/MontageScene.tsx` + zodスキーマ。1シーン = 背景1 + レイヤー配列
- 出力: カット単位・透過ProRes4444(`bg:'none'`可)+ 背景別納品(パターンカタログの納品規約)
- **カメラは全レイヤーの親(CAM_DRIFT相当)に Ken Burns を1つ**。C13アンカーカメラ文法(Position凍結・注視点駆動)を流用=弧の根絶

### 背景(bg)
| 値 | 内容 |
|---|---|
| `paper`/`texture` | 紙・テクスチャ(theme流用) |
| `ink` | 墨 |
| `media` | 実写を背景に(**波動画の下部クロップ等**)。grade=footage |
| `photo` | 全面写真(VOXテンプレA/B/C)。grade=archive/quote |
| `collage` | **切り絵コラージュ背景**(下記E参照)。生成AIテクスチャ板+破れ紙エッジ+ハーフトーン+テープ |

### レイヤー型(layers[])
| type | 用途 | 主なprops |
|---|---|---|
| `media` | 実写動画/写真を重ねる | src, crop{x,y,w,h}, scale, pos, speed, loop, grade, blend, mask, kenBurns |
| `cutout` | 白/単色背景を抜いた切り抜き(船・人・物) | src, key{lumaThreshold}, trim, scale, pos, motion{from,to,easing} |
| `counter` | 数字カウントアップ(Oswald/amber) | from, to, suffix, icon, duration, easing, pos |
| `bigStat` | **VOXテンプレB: 全画面特大数字** | value, unit, caption, srcTag, pos |
| `archiveBand` | **VOXテンプレA: 大型ロワーサード** | kickerEn, head(明朝), sub, goldbar(gold/red), srcTag |
| `quoteBlock` | **VOXテンプレC: 全面写真上の引用** | text(明朝), emphasis, source, qmark |
| `annotation` | 手描き丸・引き出し線・ラベル(朱) | kind(circle/arrow/label), from, to, text |
| `paperScrap` | 紙片・新聞見出し | text, rotate, texture |
| `sourceTag` | 左上ソースタグ(VOX信頼記号) | text[](2行まで) |
| `labelBox` | **図解ラベル箱**(黒箱+白ゴシック。例「視聴者」「プラットフォーム」) | text, pos, accent? |
| `caption` | 下部の注記・出典 | text, source, conceptual |

共通: 各レイヤーに `appearAt`(秒)/`duration`。色はtheme、数字Oswald/amber、見出し明朝。**新色・新書体の発明禁止**。

### 素材の下ごしらえ(コード側で完結=AI動画を減らす核)
- **crop**: 元動画/画像の使う矩形だけ切る(透過素材でなくてよい。例: 海動画の波部分だけ)
- **key**: 白/単色背景を簡易キーで抜く(完璧でなくてよい・資料質感に馴染ませる)
- **grade**: §1プリセットで番組ルックへ(実写の彩度を殺して墨紙に馴染ませる)
- **kenBurns**: 静止写真に緩速の生命を与える(全静止カットに標準適用)
- **blend/mask**: 紙にプリントしたように馴染ませる(multiply)/縁ぼかし

## 3. VOXデータ・テンプレA〜D(承認済みスタイルフレーム = `VOXルック_テンプレート提案_v1.html`)

MontageSceneのレイヤー合成として実装(独立コンポーネントにしない=レイヤー型の組み合わせ):

| テンプレ | 構成レイヤー | 使用カット例 |
|---|---|---|
| A アーカイブ・ロワーサード | bg:photo(archive) + sourceTag + archiveBand + kenBurns:slowIn | C25 バーネイズ / C42 ゲッベルス |
| B 全画面データ | bg:photo(暗)or media + bigStat + sourceTag | C17 ×6 / C46 600万人 / C74 年表 |
| C 引用 | bg:photo(quote) + quoteBlock + sourceTag | C26 見えない統治機構 / C54 アドルノ |
| D 資料モンタージュ | bg:paper/texture + media/cutout複数 + annotation + paperScrap + counter | C35 新聞 / C27 CPI / C49 亡命 / C52 アメリカ |

- **1画面1アクセント厳守**(金茶=概念/朱=危険・断絶/amber=数字)。VOXの品質は引き算=抑制の美学と一致
- グラフ(既存bar_chart/line_compare/stat_card)も、背景を墨ベタ→**暗い全面写真**に置換し、数字をamberに。これで「コンサル資料文法」を脱してVOX化

## 3.5 切り絵コラージュ背景(collage)+ Gemini静止画ワークフロー ★現行ベストプラクティス

添付リファレンス画(視聴者→スマホ→プラットフォームの関係図)のルック。**Geminiで静止画(人物・
テクスチャ板)を作り、切り抜いてモンタージュで動かす**——コスト・権利・品質のバランスが最良。

### 制作フロー(このルックの標準手順)
1. **Yuki(Gemini静止画生成)**: ①人物(例「スマホを見る人物・全身・無地/グリーンバック」)
   ②背景テクスチャ板数種(コンクリ・アスファルト・古紙・金属メッシュ・ハーフトーン)。**動画でなく静止画**
2. **key/切り抜き**: 人物をコード側 or 事前に透過PNG化(`public/photos/` `public/cutouts/`)
3. **collage背景の組み立て**(コード): テクスチャ板を破れ紙エッジ(mask)で不定形に配置+
   ハーフトーンドット+黄テープ/黒帯のアクセント。低彩度グレード。番組の墨×金茶に寄せる
4. **レイヤー合成**: 切り抜き人物(左)+ phoneComp/偽UI(中央)+ labelBox(視聴者・プラットフォーム)+
   annotation(視線の矢印)。各要素にKen Burns/微視差で生命を与える

### collageの構成要素(実装)
- **テクスチャ板**: `public/textures/collage/*`(Gemini/PD素材)。3〜6枚を不定形マスクで重ねる
- **破れ紙エッジ**: 各板の縁を手描き風マスク(SVG path or アルファテクスチャ)で不定形に
- **ハーフトーンドット**: 一角に網点(#C9A063 or 墨・低不透明)
- **アクセント**: 黄テープ(#C9A063寄り)・黒帯。**高彩度の純黄は使わない**(偽UIと混ぜない)
- グレード: 全体をfootage/archiveプリセットで低彩度に。人物だけ僅かに明るく浮かせる

### 権利・法務
- 生成AI人物は**架空**であること(実在人物に似せない)。顔ありは人物写真v4.1の枠内で
- テクスチャは生成AI or PD or 自撮り。実在ロゴ・実在紙面をテクスチャに混ぜない
- 概要欄の素材開示に「人物・背景の一部はAI生成静止画」を1行(誠実の実装)

### 使用カット例(第1回)
C02の関係図版・C27 CPI・C49 亡命・C52 アメリカ・人物が要る歴史カット全般。
**C33 診察室(現状 生成AI動画指定)→ collage人物+モンタージュへ変更を推奨**(v4.4の主旨)。

## 4. 先行実装の最小集合(検証シーン再現)

設計v1の§7に従い、まず3レイヤー型 `media` `cutout` `counter` + `bigStat` `archiveBand` を実装し、
**検証シーン(戦史モンタージュ: 紙背景+波動画クロップ+切り抜き戦艦スライド+0→9,000カウンター+見出し)**を
MontageDocとして再現 → 静止画→動画で番組ルック確認【人間ゲート2】→ registry登録。

## 5. QA・完了条件

1. typecheck / 決定論(乱数は`random(seed)`のみ)
2. 検証シーンの静止画3点(0%/50%/95%)を `out/qa/montage/` に。波が動き・切り抜きがスライド・数字が回ること
3. グレードで実写・写真が番組ルック(墨紙)に馴染んでいること(彩度が浮いていない)
4. 透過ProRes4444+背景別出しでPremiereに乗ること
5. パターンカタログv1のA表(登録型)に `montage_scene` を追記

## 6. Codexへの指示文(コピペ用)

> `docs/design_reference/MontageScene実装指示書_v1_VOX.md` と `資料モンタージュ設計_v1.md` を正として、
> MontageSceneコンポジション+zodスキーマ+レイヤー型(media/cutout/counter/bigStat/archiveBand/quoteBlock/annotation/paperScrap/sourceTag/caption)を実装する。
> theme.tsに§1のトークン(amber・grade・kenBurns)を追加(既存トークンは変更禁止)。
> まず§4の最小集合で検証シーンを再現し、静止画を書き出してYuki承認を得る。承認前にregistry登録・本番カット適用をしない。
> 仕様外の色・書体・レイアウトの発明は禁止。判断に迷う値は質問すること。
