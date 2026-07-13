# Remotion MG基盤 『なんだろう』解体

番組のMG(グラフ・引用・宣言・タイトル等)をJSONから半自動生成する基盤。

- **はじめての人**: [使い方マニュアル.md](./使い方マニュアル.md) を読む
- 設計の全体像: `../mg_factory/design_reference/Remotion基盤_調査設計_v1.md`

## コンポジション

| ID | 内容 |
|---|---|
| `JsonScenes` | **本命。** シーンJSON→レジストリのコンポーネントを連結して動画化 |
| `C13AttentionFlow` | 第1回C13のプロトタイプ(視線→再生→広告費ボード) |

## コマンド

```bash
npm install
npm run dev            # Remotion Studio (プレビュー)
npm run render:scenes  # data/ep02_demo.json → out/json_scenes_demo.mp4
npm run render:c13     # C13 → out/c13_attention_flow.mp4
npm run typecheck

# 別のJSONで書き出し
npx remotion render JsonScenes out/xxx.mp4 --props=./data/xxx.json
```

## シーンJSONの書き方

```json
{
  "fps": 23.976,
  "scenes": [
    {"type": "title_card", "props": {"title": "…", "episode": "…"}},
    {"type": "bar_chart", "durationInFrames": 240,
     "props": {"bars": [{"label": "…", "value": 100}], "accentIndex": 0,
               "conceptual": true, "source": "…"}}
  ]
}
```

- `type` は `src/kit/registry.tsx` にあるものだけ。無いtypeはエラーで止まる
- propsの形は各コンポーネントのzodスキーマ(違反は即エラー=AIへのフィードバック)
- `durationInFrames` 省略時はレジストリの既定尺

## 使用可能なtype (v1)

`title_card` / `statement`(M6★宣言) / `quote` / `stat_card`(研究要点) / `bar_chart` / `line_compare`

## シーンJSON一覧

| ファイル | 内容 |
|---|---|
| `data/ep01_scenes.json` | 第1回のRemotion対象カット9本(C10/C12/C15/C16/C20/C23/C29/C45/C54) |
| `data/ep02_demo.json` | 第2回のデモ5本 |

## 運用ルール(誰でも使える版)

### 写真・画像を入れたいとき

1. 画像ファイルを `remotion_mg/public/photos/ep01/` に置く(エピソード別フォルダ、
   ファイル名は半角英数のスネークケース。例: `hearst_portrait.jpg`)
2. JSONから相対パスで参照する:
   ```json
   {"type": "quote", "props": {
     "text": "君は絵を用意しろ、戦争は私が用意する。",
     "attribution": "W・R・ハーストに帰される言葉",
     "image": "photos/ep01/hearst_portrait.jpg",
     "imageCaption": "W・R・ハースト(1900年代)"
   }}
   ```
   → 写真は白フレーム+セピア寄りの質感で自動的に紙面に馴染む
3. 実在人物の写真は**パブリックドメイン(著作権切れ)か権利処理済みのみ**。
   歴史人物(ハースト、バーネイズ等)は Wikimedia Commons のPD画像でOK

### グラフの数値・色・角度を変えたいとき

コードは触らない。JSONの数字を書き換えるだけ:

```json
"series": [
  {"label": "本当", "values": [10, 16, 22, 27, 31, 34, 36], "color": "ink"},
  {"label": "ウソ", "values": [10, 20, 34, 52, 72, 88, 100], "color": "red"}
]
```

- **角度(カーブの形)** = `values` の数列そのもの。急にしたければ後半の伸びを大きく
- **色** = `"ink"`(墨) / `"red"`(朱) / `"gold"`(金茶) の3色から選ぶ
  ※これ以外の色は使わない(番組ルール)。増やすときは theme.ts に追加してから
- 変えたらStudioで即プレビュー、または `npx remotion still` で静止画確認

### グラフ表現(型)の決め方

| 伝えたいこと | 使う型 |
|---|---|
| 「AよりBが多い/大きい」の比較・ランキング | bar_chart |
| 「時間とともに」「AがBを追い抜く」 | line_compare |
| 大きな数字・固有名を1〜4個ドンと見せる | stat_card |
| 研究・発言そのものを見せる | quote |
| 結論の断言 | statement |

迷ったら**候補出し**を頼む: 同じデータでbar版とline版とstat版の静止画を
並べて出せる(このパイプラインなら数分)。見比べて選ぶのが最速

### 同じ型の使い回しについて

- 型(見た目の文法)の使い回しは**意図的**。番組の統一感の源
- ただし隣接する回で「同じ型+似た形のデータ」が続くと既視感が出るので、
  データの形(本数・カーブ・強調位置)やラベルは回ごとに変える
- 新しい見せ方が欲しくなったら型を増やす(拡張ループ)。乱造はしない

## ルール

- 新しい画の型が必要になったら: コンポーネントを書き、Studioで確認してから
  `registry.tsx` に登録する。**JSONにコードを書かせない・使い捨てコンポーネントを作らない**
- 色・フォント・質感は `src/kit/theme.ts` と `stages.tsx` のみが持つ。
  コンポーネントに直書きしない
- フォントは@fontsource同梱・素材は`public/`(環境非依存。OSフォントに頼らない)
