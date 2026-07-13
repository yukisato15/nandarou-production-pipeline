# Remotion MG基盤 『なんだろう』解体

番組のMG(グラフ・引用・宣言・タイトル等)をJSONから半自動生成する基盤。
設計の全体像: `../mg_factory/design_reference/Remotion基盤_調査設計_v1.md`

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

## ルール

- 新しい画の型が必要になったら: コンポーネントを書き、Studioで確認してから
  `registry.tsx` に登録する。**JSONにコードを書かせない・使い捨てコンポーネントを作らない**
- 色・フォント・質感は `src/kit/theme.ts` と `stages.tsx` のみが持つ。
  コンポーネントに直書きしない
- フォントは@fontsource同梱・素材は`public/`(環境非依存。OSフォントに頼らない)
