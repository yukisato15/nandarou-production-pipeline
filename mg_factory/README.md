# NANDAROU MG Factory v0.2

コンテxlsxからMG専用JSONを作り、1920×1080 / 23.976fpsのAfter Effects用コンポと架空UIを生成します。

## 現在の実装範囲（18 / 37カット）

| 系統 | Cut | 主な内容 |
|---|---|---|
| 番組用AEマスター | C01, C03, C10, C20, C40, C42, C45, C52, C54, C55 | サムネカード、宣言、タイトル、ロゴ、次回予告、エンドカード |
| データMGキット | C12, C13, C15, C16, C25 | 棒グラフ、3段フロー、統計カード、2線比較、置換図解 |
| UI／実写合成 | C26, C46, C48 | 架空広告フィード、値札増殖、3項目まとめ |

C20とC40は、AE上でも同じ`MASTER_DECLARATION_FRIENDS_FOR_SALE`コンポを参照します。

## 再生成

```bash
python3 update_mg_production_plan.py
python3 conte2mg.py 第1回_コンテ表_v1.xlsx --output output/ep01_mg.json
python3 build_ui_previews.py output/ep01_mg.json
python3 build_mg_factory.py output/ep01_mg.json
```

JSONと必須パラメータだけを検証する場合:

```bash
python3 build_mg_factory.py output/ep01_mg.json --check
```

少数カットだけを安全に試す場合:

```bash
python3 build_mg_factory.py output/ep01_mg.json --cuts C01,C12
```

部分生成は`NANDAROU_MG_FACTORY_EP01_TEST_C01_C12`へ出力され、本番のEP01フォルダを削除しません。EP02も別ownerとして共存できます。

## After Effectsで確認

1. After Effectsを起動し、空の試作用プロジェクトを開く。
2. 「ファイル > スクリプト > スクリプトファイルを実行」。
3. 初回は`mg_factory/generated/generate_mg_factory_smoke.jsx`を選択し、代表5カットだけ確認する。
4. 問題なければ`generate_mg_factory.jsx`を実行する。
5. 自動で開く`EP01_MG_REVIEW_REEL`を確認する。

出力リールは2種類あります。

- `EP01_MG_REVIEW_REEL`: 実装カットを順に詰めた短い確認用
- `EP01_MG_TIMELINE_REEL`: コンテの元TCへ配置した本番照合用

JSXは最初に`_BUILDING`フォルダへ構築し、成功時だけ同じownerの前回版と入れ替えます。途中エラー時は新しい`_BUILDING`だけを削除するため、前回成功版は残ります。生成コンポへ直接加えた手修正は次の成功時に消えるため、修正を残す場合は別フォルダへ複製してください。

## Design v2（見た目の再設計テスト）

v0.2の機能試作とは別に、C01・C13・C25だけを番組の完成ルックとして作り直しています。

```bash
python3 build_mg_factory_design_v2.py output/ep01_mg.json
```

AEでは`generated/generate_mg_factory_design_v2.jsx`を実行します。出力先は`NANDAROU_MG_FACTORY_EP01_DESIGN_V2`で、v0.2の生成物とは別に共存します。デザイン原則は[DESIGN_V2.md](DESIGN_V2.md)を参照してください。

## C26 HTMLプレビュー

`generated/ui/C26_UI_AD_FEED_SCROLL.html`をChromeで開きます。

- Space: 再生／停止
- 左右矢印: 1フレーム移動
- Shift＋左右矢印: 10フレーム移動
- Home: 先頭へ戻る
- H: 操作パネル表示切替

画面収録用URLパラメータ:

```text
?capture=1&autoplay=1
```

静止確認:

```text
?capture=1&frame=100
```

`window.MGPreview.setFrame(frame)`を公開しているため、将来PlaywrightでPNG連番を作る際にも同じHTMLを利用できます。

## 意図的に手動へ残している箇所

- C01/C03のカードは架空サムネ。完成サムネへ差し替え可能です。
- C10の粒子アウトはマーカーのみ。後から番組共通プリセットへ置換します。
- C15の出典値はコンテ記載値で、公開前に原典確認が必要です。
- C12/C16は実測グラフではなく「概念図」と明示します。
- C26はHTML版が正本、AE内にも確認用フォールバックを生成します。
- C46の背景はEnvato日常実写へ差し替えるプレースホルダーです。人物の顔を避ける座標は実写決定後に設定します。
- C48の背景は静かな室内光の実写へ差し替えます。
- C52はロゴSVG確定前の線画＋文字版です。

## 回帰テスト

```bash
python3 -m unittest tests/test_mg_factory.py -v
```

テストでは18カットのパラメータ、23.976fpsのフレーム計算、BOM/ES3、部分生成の隔離、決定性、検証モードの非書き込みを確認します。

## フォルダ

```text
mg_factory/
├── README.md
├── DESIGN_V2.md
├── template_registry.py
├── generated/
│   ├── generate_mg_factory.jsx
│   ├── generate_mg_factory_smoke.jsx
│   ├── generate_mg_factory_design_v2.jsx
│   └── ui/
│       └── C26_UI_AD_FEED_SCROLL.html
└── schema/
    └── mg.schema.json
```
