# Tech Stack

## 実装で確認できるもの

| 技術 | 用途 | 状態 |
|---|---|---|
| React 18 | Composition/コンポーネントUI | 使用中 |
| TypeScript 5 | 型、Remotionコンポーネント | 使用中 |
| Remotion 4.0.489系 | Studio、CLI、動画/静止画レンダー | 使用中 |
| Zod 4 | Scene/Telop入力の実行時検証 | 使用中 |
| `@fontsource/*` | Noto Sans JP、Oswald、Shippori Minchoの同梱フォント | 使用中 |
| `@remotion/*` | effects、noise、motion-blur、sfx、shapes、transitions等 | 依存関係に含む。各APIの利用はファイル単位で確認する |
| Python 3 + openpyxl | Excel→SRT/JSON変換、検証 | 使用中 |
| FFmpeg/Remotion codec | 透過ProRes、MP4レンダー | Remotion CLI経由で使用 |
| Google Fonts | `@remotion/google-fonts`依存はあるが、標準フォントはFontsource | 外部CDN運用ではない |

## 依存関係の流れ

`openpyxl`がExcelを読み、PythonがSRT/JSONを出力する。RemotionはJSONをZodで検証し、Reactコンポーネントをレンダーする。素材は`remotion_mg/public/`から`staticFile()`で参照する。Premiereはレンダー済み素材を実編集に組み込む。

## 未確認・未実装として扱うもの

- **Whisper**: `@remotion/openai-whisper`パッケージは依存関係にあるが、このリポジトリの通常制作フローで呼ぶ実装は確認できない。自動文字起こし機能が完成済みとは扱わない。
- **Cloud Run / Lambda**: デプロイ先として拡張可能だが、現リポジトリに実行設定・ジョブ・本番接続は確認できない。
- **外部API**: Pythonのコンテ変換は外部APIを使わない。AIサービスとの連携を前提にしない。

## 主なコマンド

```bash
cd remotion_mg
npm install
npm run dev
npm run typecheck
npm run render:scenes
npm run render:c13
npx remotion render JsonScenes out/custom.mp4 --props=./data/custom.json
./render_telops_per_cut.sh
```

パート単位の`render:telops:p0`〜`p5`はpackage.jsonに残る旧コマンドであり、納品の標準ではない。
