# archive（旧路線の隔離場所）

**このフォルダは削除予定の隔離場所です。新規参照禁止。ここのコードを現役に戻すときは AGENTS.md の人間ゲートを通してください。**

現行の制作パイプラインから役目を終えたAE図形描画路線、一回限りの更新ツール、重複素材を移動しています。削除はせず、移動日と後継を記録します。

| ファイル/フォルダ | 旧所在 | 隔離理由 | 隔離日 | 後継 |
|---|---|---|---|---|
| `ae_pipeline/build_mg_factory.py` / `build_mg_factory_design_v2.py` / `build_jsx.py` | ルート | 旧AE図形描画路線 | 2026-07-17 | Remotion / `tools/conte2mg.py` |
| `ae_pipeline/generate_ae_layers.jsx` | ルート | 旧テロップAE配置 | 2026-07-17 | Remotion TelopOverlay |
| `ae_pipeline/build_ui_previews.py` | ルート | HTML→画面収録方式 | 2026-07-17 | Remotion直接レンダー |
| `ae_pipeline/DESIGN_V2.md` | `mg_factory/` | 旧設計書 | 2026-07-17 | `docs/design_reference/` |
| `ae_pipeline/generated/` | `mg_factory/generated/` | 旧生成物・UIプレビュー | 2026-07-17 | `remotion_mg/` |
| `oneshot_tools/` | ルート | 適用済みの一回限り更新ユーティリティ | 2026-07-17 | コンテ表・現行ツール |
| `duplicates/` | `remotion_mg/public/`等 | 参照先と重複する素材 | 2026-07-17 | `docs/design_reference/eyecatch_review/` |

`out/` は再生成物の作業場所であり、Git管理外です。出力が必要な場合は現行ツールで再生成してください。
