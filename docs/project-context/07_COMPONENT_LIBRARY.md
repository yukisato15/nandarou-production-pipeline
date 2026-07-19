# Component Library

## JSON registry（再利用型）

| type | 役割 | 主なprops | 依存 |
|---|---|---|---|
| `title_card` | 墨背景の回タイトル/章見出し | `title`, `episode?`, `subtitle?` | `TitleCard`, `InkStage`, `theme` |
| `thumbnail_stack` | C01用の偽サムネ7枚フライスルー。手前から飛来し、画面を覆ってから固定スロットへ着地 | `images[7]`, `durationInFrames?` | `ThumbnailStack`, `Img`。座標・タイミング・回転・グローは承認済み仕様に固定 |
| `phone_feed_hesitation` | YouTube風フィード、停止、指の逡巡、主役着弾 | `images[]`, `heroImage?` | `PhoneFeedHesitation`, `Img`, frame interpolation |
| `statement` | 墨背景の宣言/M6 | `text`, `emphasis?`, `startAt?` | `Statement`, `InkStage`, `theme` |
| `quote` | 紙片の引用、帰属、真偽注記 | `text`, `attribution?`, `note?`, `image?`, `imageCaption?` | `Quote`, `PaperStage`, `staticFile` |
| `stat_card` | 大きな数字/固有名の提示 | `title?`, `items[{value,label}]`, `source?`, `conceptual?` | `StatCard`, `PaperStage`, `SourceNotes` |
| `bar_chart` | 横棒比較/ランキング | `title?`, `bars[{label,value,suffix?}]`, `accentIndex?`, `source?`, `conceptual?` | `BarChart`, `PaperStage`, `spring` |
| `line_compare` | 最大3系列の折れ線比較 | `title?`, `series[{label,values,color}]`, `xLabels?`, `source?`, `conceptual?` | `LineCompare`, SVG, `PaperStage` |

実際に使えるpropsの正本は各`*Schema`と`src/kit/registry.tsx`です。上表にないpropsをAIが推測して追加してはいけません。

## 専用Composition

| id | 用途 | 入力/状態 |
|---|---|---|
| `JsonScenes` | registry型をJSON順に再生 | `ScenesDoc`; 尺をJSONから計算 |
| `TelopOverlay` | S2/S3/S5透過テロップ | `data/ep01_telops.json`; `cut`を推奨 |
| `C13AttentionFlow` | C13ボード型の単発MG | 専用コード、スタイルフレーム承認対象 |
| `C06GreenPhoneScreens` | C06元素材に合わせた列別スマホ画面 | 現在25fps、専用propsなし |
| `PhoneCloudTransparent` | 透過背景のスマホ群 | 現在25fps、専用コード |
| `Ep01Thumbnail` / `C01SingleThumbnail` | 第1回サムネ/偽サムネ静止画 | `variant`または画像/index |
| `NandarouKaitai*` | アイキャッチ | `variant`, `audioMode`等。`ident/timing.ts`が尺の正本 |
| `EpisodeTitle` / `episode_title` | アイキャッチ直後のエピソードタイトル | `episodeNumber`, `titleParts`, HUDラベル（任意） | `theme.ts`, `random()` |

## 使用例

```json
{
  "fps": 23.976,
  "scenes": [
    {"type": "bar_chart", "id": "C12", "props": {
      "title": "不安ワードの伸び",
      "bars": [{"label": "経済が終わる", "value": 80}],
      "source": "出典名"
    }}
  ]
}
```

新しい型は、コンポーネント→静止画承認→registry/schema→マニュアル更新の順で追加する。
