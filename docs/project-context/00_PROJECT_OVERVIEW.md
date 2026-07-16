# Project Context — 『なんだろう』解体 MG基盤

## 5分で読むための要約

このリポジトリは、YouTube番組『なんだろう』解体の制作を、コンテ表・JSON・Remotion・Premiereへ接続するための制作基盤です。番組の映像素材、テロップ、データMG、資料モンタージュ、アイキャッチを再利用可能な形で管理します。

主な利用者は、番組制作者Yukiと、制作を補助するChatGPT/Codex/ClaudeなどのAIです。AIはコードを自由生成するのではなく、既存の型・レジストリ・JSONを使い、必要な新しい画だけ人間承認後に拡張します。

## 目次

- [01 Goals](./01_GOALS.md)
- [02 Design Philosophy](./02_DESIGN_PHILOSOPHY.md)
- [03 Workflow](./03_WORKFLOW.md)
- [04 Tech Stack](./04_TECH_STACK.md)
- [05 Coding Rules](./05_CODING_RULES.md)
- [06 UI Design](./06_UI_DESIGN.md)
- [07 Component Library](./07_COMPONENT_LIBRARY.md)
- [08 Prompts](./08_PROMPTS.md)
- [09 Decisions](./09_DECISIONS.md)
- [10 TODO](./10_TODO.md)

## 現在の境界

- **S1字幕**: `tools/conte2srt.py`でSRTを生成し、Premiereで扱う。
- **S2/S3/S5テロップ**: `conte2telops.py` → Remotion `TelopOverlay`。納品はカット単位の透過ProResを基本とする。
- **S4宣言**: `JsonScenes`の`statement`などフルフレーム画で扱う。
- **S6**: サムネイル/ポストなど画像側に含める。
- **データMG**: `data/*.json` → `JsonScenes` → レジストリ登録済みコンポーネント。
- **資料モンタージュ**: 設計資料はあるが、汎用`MontageScene`は未実装。
- **Premiere**: 実写・ナレーション・SRT・透過素材・音を最終編集する場所。

## まず見るファイル

1. `AGENTS.md` — プロジェクト憲法と不変ルール
2. `remotion_mg/README.md` / `remotion_mg/使い方マニュアル.md` — 実行手順
3. `remotion_mg/src/Root.tsx` — Studioに登録されたComposition
4. `remotion_mg/src/kit/registry.tsx` — JSONで選べる画の一覧
5. `remotion_mg/src/kit/theme.ts` / `stages.tsx` — 色・フォント・共通質感
6. `remotion_mg/data/` — 実際のシーン入力

## 注意

この文書はコードを基準に更新します。`out/`、動画ファイル、ローカル生成物は再現可能な成果物ではあるものの、通常Git管理しません。古いREADMEに残るパート単位テロップコマンドは、現在の方針（カット単位）と矛盾するため、[09 Decisions](./09_DECISIONS.md)を優先してください。
