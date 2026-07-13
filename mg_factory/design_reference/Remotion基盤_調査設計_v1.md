# Remotion制作基盤 調査・設計・実装報告 v1

2026-07-13 / Fable
対象: 『なんだろう』解体のMG制作基盤(図解・グラフ・年表・テロップ・UI風・引用・タイトル)

---

## 0. 結論(先に)

- **「コンポーネント選択方式」は正しい。** ただし「AIの自由生成」も捨てず、役割を2ループに分離する
  - **制作ループ**(毎カット): JSON→レジストリ選択→レンダー。コード生成なし
  - **拡張ループ**(たまに): 新しい画の型が必要なときだけ、AIがコンポーネントを起案→人間がStudioで承認→ライブラリ入り
- プロトタイプは実装済み(`remotion_mg/`)。JSON入力→コンポーネント選択→プレビュー→MP4出力まで動作確認済み
- AEは廃止しない。**質感の最終合成・カメラ・特殊カットはAE/Premiere、量産される情報カットはRemotion**

---

## 1. 調査結果

### 1-1. Remotion公式

- React+CSS+SVG+Canvas/WebGLで1フレームずつ決定論的に描画→MP4/WebM/ProRes(透過)
- 公式パッケージ: `@remotion/transitions`(フェード・ワイプ等7種)、`@remotion/shapes`、
  `@remotion/layout-utils`(テキスト実測)、`@remotion/captions`+whisper連携、
  `@remotion/motion-blur`、`@remotion/effects`(glow等)、`@remotion/google-fonts`、lottie、three
- **得意**: データ駆動・差し替え量産・バージョン管理・決定論的レンダー・透過書き出し
- **苦手**: AE的な有機的エフェクト(パーティクル大量・流体・3Dカメラ・ライトリーク)、
  手作業のタイミング微調整のGUI、モーションブラー(後付けHOCで可能だが重い)
- **ライセンス**: 個人・従業員3人以下は商用無料(確認済み)。現体制では無料
- fps=23.976、1920×1080、ProRes4444透過→AE/Premiere載せ、全て問題なし(実証済み)

### 1-2. Prompt-to-Motion-Graphics(公式テンプレート)

`remotion-dev/template-prompt-to-motion-graphics(-saas)`

- 思想: プロンプト→検証→**スキル検出**→コード生成→サニタイズ→ブラウザ内Babelコンパイル→即プレビュー
- スキル=2種の知識モジュール
  - ガイダンススキル(チャート・タイポ・遷移のベストプラクティス)
  - サンプルスキル(実装済みコードの参照=実装アーキタイプ)
- 「基本プロンプトを軽く保ち、リクエストごとに関連知識だけ動的注入」
- **評価**: 思想は優秀だが、これは「毎回違う見た目を作るSaaS」向け。番組には
  ①ルックの一貫性が守れない ②同じ画を再現できない ③レビュー不能なコードが量産される、
  の3点で不適。**転用するのは「スキル注入」の考え方だけ**——番組のデザイン規則を
  スキル化してAIに渡し、生成する対象を「使い捨てコード」ではなく「レジストリ入りするコンポーネント」にする

### 1-3. Agent Skills

- `npx skills add remotion-dev/skills` で公式スキル9種(best-practices / create / markup /
  render / captions / saas / interactivity / mediabunny)。Claude Code・Codex・Cursor対応
- skills.shで12.6万インストール、映像系スキルで最大手。**導入推奨**(拡張ループでの
  コンポーネント起案の品質が上がる)
- 追加で**番組専用スキル**を作るべき: デザイントークン・禁止事項(英字装飾禁止等)・
  テロップ規定・出典表記規則をスキル化 → AIが新コンポーネントを書くとき常に注入

### 1-4. GitHub OSS評価

| OSS | 内容 | 採否 | 理由 |
|---|---|---|---|
| `remotion-dev/skills` | 公式Agent Skills | **採用** | 拡張ループの品質向上。無料 |
| `remotion-dev/template-prompt-to-motion-graphics` | AI自由生成SaaS雛形 | 思想のみ採用 | 上記1-2 |
| `lifeprompt-team/remotion-scenes` | 201シーン集(MIT) | **部品として参考採用** | テキスト・遷移・パーティクルの実装パターン集として優秀。ただし見た目はそのまま使わない(ルックが番組と喧嘩する)。実装の参考書として使う |
| `reactvideoeditor/remotion-templates` | 無料テンプレ81種 | 参考のみ | 同上。アニメーションのイージング実装の参考 |
| remotion.pro Timeline / Editor Starter | 有料エディタUI部品 | **不採用** | 最終編集はPremiereで行うため、ブラウザ編集UIは不要 |
| `@remotion/captions` + whisper.cpp | 字幕自動生成 | 将来検討 | S1字幕はconte2srt→Premiereで完成済み。競合しない |
| designcombo等 React Video Editor系 | ブラウザ動画編集 | 不採用 | 同上(Premiereが編集席) |
| Revideo / Motion Canvas | Remotion代替 | 不採用 | エコシステム・AI対応・実績でRemotionが優位。既にC13資産もある |

---

## 2. アーキテクチャ(採用案)

```
台本/コンテExcel
   │  (既存: conte2srt.py / ep02のRMT_*指定)
   ▼
シーンJSON (ScenesDoc: type + props + duration)
   │  zodスキーマで検証 ←← AIのSelectorはここまでしか触れない
   ▼
レジストリ (src/kit/registry.tsx)
   │  type → コンポーネント + スキーマ + 既定尺
   ▼
Remotion (JsonScenesコンポジション)
   │  Studioでプレビュー / --props=別JSONで差し替え
   ▼
MP4 / ProRes4444(透過) → Premiere(編集席) / AE(質感が要る場合)
```

### 2つのループ

**制作ループ(毎カット・自動化対象)**
AI/人間はJSONだけを書く。typeはレジストリから選ぶ。schema違反は即エラー=AIへのフィードバック。
コードは1行も生成しない。→ ルック一貫性・再現性・レビュー可能性が構造的に保証される

**拡張ループ(新しい画の型が必要なとき)**
公式Remotionスキル+番組デザインスキルを注入したAIがコンポーネントを起案
→ Studioで人間が確認・調整 → レジストリ登録 → 以後は制作ループで使い回し。
「AIの自由生成」はここに封じ込める。承認なしにレジストリへ入らない

### LOOK層の分離

`src/kit/stages.tsx` = 紙/墨のステージ+グレイン+ビネット(=机とフィルム)。
シーンコンポーネントは構図と情報だけを持つ。C13で決めた
「共通化するのは質感と規則、構図と意味はカットごと」をコードの層構造として実装

---

## 3. 実装済みプロトタイプ

場所: `remotion_mg/`(C13AttentionFlowと共存)

```
src/kit/
  theme.ts        デザイントークン(紙・墨・金茶・朱、フォント、テクスチャ)
  fonts.ts        @fontsource自前ホスティング(環境非依存)
  stages.tsx      PaperStage / InkStage / SourceNotes(出典・概念図注記)
  registry.tsx    type→コンポーネント+zodスキーマ+既定尺。resolveScenes()
  components/
    TitleCard.tsx   墨背景タイトル(トラッキングイン+金茶罫)
    Statement.tsx   M6★宣言(1文字2Fずらし・強調語のみ金茶1.15倍=テロップ規定準拠)
    Quote.tsx       紙片の引用(帰属+真偽注記=法務規則準拠)
    BarChart.tsx    紙資料風横棒(明朝ラベル+Oswaldカウントアップ+朱アクセント1本)
    LineCompare.tsx 折れ線比較(ラフエッジ+「追い抜き」型)
src/compositions/JsonScenes.tsx   ScenesDoc→<Series>展開。尺はJSONから自動計算
data/ep02_demo.json               第2回の実カット(C10/C12/C16/C24/C18)のデモ
```

使い方:
```bash
npm run dev            # Studio(JsonScenesを選択、右パネルでJSON編集可)
npm run render:scenes  # data/ep02_demo.json → out/json_scenes_demo.mp4
npx remotion render JsonScenes out/xxx.mp4 --props=./data/別ファイル.json
```

検証済み: 型チェック / 5シーンの静止画(番組ルック確認) / MP4書き出し

---

## 4. コンポーネントライブラリの優先順位

### 実装済み(v1)
1. **TitleCard** / 2. **Statement(M6)** / 3. **Quote** / 4. **BarChart** / 5. **LineCompare**

### 次に作るべき(第2回で実際に使う順)
6. **CounterEquation**(😡=👍×5、数値カウンター) — 第2回C15/C40。C13の再生カウンターを移植
7. **KickerList**(3点まとめの順積み) — 第2回C44。毎回使う
8. **TimelineScene**(年表: 1890→1930→1960→2000→現在) — 歴史パートの背骨。横スクロール型
9. **ComparisonCard**(左右対比: 「事実」vs「興奮」) — C25型の平面版

### その後(素材が要るもの)
10. **FlowBoard**(分解図ボードのRemotion版) — C13型。画像素材+接続線。カメラはtransformで可能だが、質感の要求が高いカットはAEマスター継続でよい
11. **FeedMock / UIモック** — HTML得意領域。ただし「画面収録」ではなくRemotionで直接レンダーに統一できる
12. **NetworkGraph** — 使用頻度が低いので急がない

補足: Definition / Summary はTitleCard・Statement・KickerListの変種として実装できるため、
独立コンポーネントにしない(型の増殖はSelectorの精度を下げる)

---

## 5. 7つの質問への回答

1. **この構成は実用的か** → 実用的。プロトタイプが実カットのJSONで動いている。
   「JSON→選択→レンダー」は毎回同じ画質を再現し、schema検証がAIの誤りを機械的に弾く

2. **AEをどこまで代替できるか** → 情報カット(グラフ・年表・引用・宣言・タイトル・UI風)は
   ほぼ100%代替可能で、むしろRemotionが上(差し替え・再現性)。代替できないのは
   ①写真・質感合成の追い込み(C13ボードの紙の空気) ②有機的エフェクト ③手のタイミング芸。
   体感では第2回コンテの51カット中、Remotion系で20前後、AEマスター複製20、実写系11

3. **AIはどこまで自由生成させるべきか** → 制作ループでは0%(JSONのみ)。
   拡張ループでは100%自由に書かせてよいが、人間承認を通らないとレジストリに入らない。
   「自由生成の出口をライブラリにする」のが答えで、使い捨てコードを許すと第1回の失敗
   (毎画面で意匠を発明)がAI速度で再発する

4. **Component化すべき範囲** → 「番組で3回以上使う画の型」だけ。1回きりの固有演出は
   コンポーネント化せず、AE(または単発コンポジション)で作る。
   また色・フォント・質感はコンポーネントに持たせずtheme/stagesに集約(1箇所変更で全部変わる)

5. **採用すべきOSS** → 必須: `remotion-dev/skills`(公式Agent Skills)。
   参考書として: `lifeprompt-team/remotion-scenes`(MIT・実装パターン集)。
   不要: 有料Timeline/Editor(編集席はPremiere)、React Video Editor系、Revideo等の代替

6. **最も重要な技術課題** → 技術よりも**「レジストリの統治」**。
   (a) 新typeを安易に増やさない規律(型が30個を超えるとSelectorも人間も選べなくなる)
   (b) schemaの後方互換(過去回のJSONが将来も同じ画を出すこと)
   (c) 純技術では長尺レンダー時間(1080p実測で約1.5分/30秒尺→許容範囲)と
   日本語の行組み(禁則・折返しは@remotion/layout-utilsで実測制御が必要になる)

7. **最適アーキテクチャ** → 本ドキュメント2章の2ループ構成。
   将来の伸ばし方: ①コンテExcelのRMT_*行→ScenesDoc自動変換(conte2mg.pyの流用)
   ②番組デザインスキルの整備 ③透過ProRes書き出しでLOOK_GLOBAL(AE)との合流

---

## 6. 使い分けの最終整理(第2回実務)

| カット種別 | 作り方 |
|---|---|
| グラフ・カウンター・年表・引用・★宣言・タイトル | **Remotion**(JsonScenes+レジストリ) |
| 分解図ボード(質感重視: C13型) | AEマスター複製(既存) |
| 偽サムネ・偽UI静止画 | Canva/Photoshop+AI画像(既存フロー) |
| 実写・歴史AI静止画 | Envato / Runway(既存フロー) |
| 最終合成・音・呼吸 | Premiere(+必要カットのみAE) |
