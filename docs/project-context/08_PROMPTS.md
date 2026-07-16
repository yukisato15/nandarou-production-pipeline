# Prompts for Future AI Work

## 共通の冒頭

```text
このリポジトリのAGENTS.mdとdocs/project-context/を先に読み、git statusと対象コードを確認してください。
推測で仕様を補わず、実装済み・旧仕様・未実装を分けて報告してください。
Remotionの既存registry/schema/themeを優先し、コードを書く前に変更範囲と検証方法を示してください。
```

## コーディング依頼

```text
目的: [カット/機能]
入力JSON: [ファイル]
利用する既存type/component: [registry名]
変更してよいファイル: [一覧]
変更してはいけない挙動: [一覧]
完了条件: npm run typecheck、静止画確認、必要なCLIコマンド
まず原因・設計案・差分予定を説明し、承認後にapply_patchで実装してください。
```

## デザイン依頼

```text
既存のtheme/stagesを使用し、紙・墨・金茶・朱の番組ルックを維持してください。
意味のない装飾を足さず、構図、文字、素材、出典、尺を先に定義してください。
新しい画の型は、実装前に1920x1080の静止画フレームと入力props例を提示してください。
```

## レビュー依頼

```text
次をコード根拠付きでレビューしてください:
1. Zod schemaと実データの整合
2. fps/尺/Sequence境界
3. SRT・テロップの重複と可読尺
4. 画面端・改行・出典・conceptual注記
5. レンダー再現性（乱数/CSS animation/外部CDN）
6. AGENTS.mdとdocs/project-context/の決定事項違反
問題を「必須修正/推奨/未確認」に分け、修正は依頼されるまで行わないでください。
```

## 引き継ぎテンプレート

```text
現在のブランチ/コミット: [git rev-parse --short HEAD]
変更ファイル: [git status --short]
目的: [一文]
確認済みコマンド: [typecheck/render/still]
未解決: [一覧]
人間の承認待ち: [スタイルフレーム/素材/権利]
```
