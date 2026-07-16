# TODO / Current Status

## 完了・実装済み（コードで確認）

- Remotion project、Studio、CLI、TypeScript typecheck。
- `JsonScenes`のJSON→registry→Zod→Series再生とJSON尺計算。
- `title_card`, `statement`, `quote`, `stat_card`, `bar_chart`, `line_compare`, `thumbnail_stack`, `phone_feed_hesitation`のregistry登録。
- `TelopOverlay`のS2/S3/S5入力とカット選択、透過ProRes向けレンダー経路。
- `render_telops_per_cut.sh`のカット単位レンダー。
- `NandarouKaitaiIdent`の音声モード、タイミング定数、最終ロゴbboxログ。
- 第1回/第2回のコンテ表、SRT/テロップ/シーン変換スクリプト群。

## 進行中・要棚卸し

- 第1回Remotion成果物を、完成・仮・旧・未出力に分類する。
- `out/`の動画は再生成物のため、入力JSON・コマンド・検査結果とセットで確認する。
- `remotion_mg/README.md`の旧パート単位テロップ手順を、カット単位の現行手順へ整理する。
- 未コミットのユーザー作業（`git status`で確認）を、勝手に破棄・上書きしない。

## 次に着手する優先順

1. **C25**: 「商品そのもの → なれる自分」の重要図解。静止画承認後に実装。
2. **C18**: 「あなたの弱さではありません。人間の仕様です。」の補助画。抽象回路/人間仕様図を検討。
3. **C42**: 箸休め。作り込みすぎず、呼吸を作る。
4. 第1回未出力カットのレンダーと成果物台帳化。
5. 第2回テロップ生成・検証・カット単位出力。
6. `資料モンタージュ設計_v1.md`に基づくMontageSceneの静止画フレームを提案し、人間承認後に実装。

## 未実装・将来候補

- 汎用MontageSceneと素材のクロップ/キー/グレード/注釈レイヤー。
- Cloud Run/Lambdaのレンダージョブ、Whisper自動文字起こしの実運用接続。
- `.ffx`/MOGRT/After Effects自動配置の本番連携。
- 第2回のC15/C40専用コンポーネントと本番データ仕上げ。

## 各AIが作業開始前に必ず行うこと

```bash
git status --short
cd remotion_mg && npm run typecheck
```

対象JSONとCompositionをStudioまたは`remotion still`で確認し、変更前に「変更範囲・維持する挙動・検証方法」を報告する。スタイルフレームや法務・素材権利が未承認なら、コード実装を先に進めない。
