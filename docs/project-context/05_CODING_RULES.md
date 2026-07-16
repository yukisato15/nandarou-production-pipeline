# Coding Rules

## 命名規則

- React component/file: PascalCase（例 `BarChart.tsx`, `JsonScenes.tsx`）。
- JSON scene `type`: snake_case（例 `bar_chart`, `phone_feed_hesitation`）。
- Composition id: PascalCaseまたは用途が明確な固有ID（例 `JsonScenes`, `C06GreenPhoneScreens`）。
- データは`data/ep01_scenes.json`のように回・用途を含める。
- レイヤー・カットIDはコンテ表の`C01`形式を維持する。

## フォルダ構成

```text
remotion_mg/
  src/Root.tsx                 # Studio/CLIへの登録
  src/compositions/            # 単発Composition、特殊演出
  src/kit/components/          # JSONから再利用する型
  src/kit/registry.tsx         # type→schema→component
  src/kit/theme.ts             # 色、フォント、テクスチャ
  src/kit/stages.tsx           # PaperStage/InkStage/出典
  src/ident/                   # アイキャッチのタイミング・専用ロジック
  data/                        # Scene/Telop JSON
  public/                      # フォント以外の素材・音声
  out/                         # ローカル生成物（Git管理しない）
```

## コンポーネント分割

画面の型を3回以上使う見込みなら`kit/components`へ追加し、schemaとregistry entryを同時に作る。1回限りの画は`compositions`へ置く。色・共通背景・出典注記は`theme.ts`/`stages.tsx`へ寄せる。巨大なコンポーネントに全回の分岐を詰め込まない。

## コメント方針

「何をしているか」ではなく「なぜこの数字・境界・例外なのか」を日本語で記録する。特にfps、尺、読み速度、素材の権利・概念図注記、旧仕様との互換部分には理由を書く。

## 禁止事項

- AIにコード生成をさせ、registry/schemaを迂回すること。
- JSONを黙って補正・削除すること。入力不備はエラーにする。
- コンポーネント内へ色・フォントを直書きすること。
- 人間承認前に新しい画の型をregistryへ登録すること。
- 意味のない英字装飾、常時表示HUD、線・四角・丸だけの完成画。
- 透過テロップをパート絶対時刻で納品すること。

## レビュー基準

1. `npm run typecheck`が通る。
2. JSONがZod schemaに適合する。
3. `validate_telops.py`と`conte2srt.py`の警告を確認する。
4. 静止画をStudio/`remotion still`で確認し、余白・可読性・出典・権利を確認する。
5. 既存のtheme/registry/カット単位ルールを壊していない。
