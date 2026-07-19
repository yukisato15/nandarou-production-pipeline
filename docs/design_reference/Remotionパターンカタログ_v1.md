# Remotion パターンカタログ v1 — 再利用の台帳

2026-07-18 / 対象: `remotion_mg/` 全実装(2026-07-18時点の棚卸し)
**新しい画を作る前に、必ずこのカタログを見る。** 既存の型・文法で作れるなら新規実装しない。
新パターンを追加したら、実装コミットと同時にこのカタログへ1行追加する(台帳が古びたら意味がない)。

## 再利用の3ルート

1. **登録型(registry)** — コードを書かずJSONだけで再利用(制作ループ)。`data/*.json`に書いて`JsonScenes`でレンダー
2. **コンポジション** — propsを差し替えて再利用(回番号・画像・文言)。コード変更は原則不要
3. **モーション文法** — 実装は都度でも、動きのパラメータ(F・easing・px)を流用する。§Cの数値が唯一の正

---

## A. 登録型カタログ(registry.tsx / JSONで再利用)

| type | 画 | 主なprops | 使用実績 |
|---|---|---|---|
| `title_card` | 墨背景タイトル(トラッキングイン+金茶罫) | title, episode?, subtitle? | 章見出し汎用 |
| `episode_title` | 回タイトルカード(HUD残滓→墨のブリッジ) | episodeNumber, titleParts[2] | C10T。**全15回で再利用**(propsのみ) |
| `statement` | S4黒画面宣言(1文字2Fずらし・強調金茶) | text, emphasis? | M6★宣言汎用(C48・C51・C57候補) |
| `quote` | 紙片の引用(帰属+真偽注記) | text, source, note? | S3引用汎用(C26・C28・C31・C54) |
| `stat_card` | 研究数字カード | kicker, year, value, caption | C15・C17 |
| `bar_chart` | 紙資料風横棒(Oswaldカウントアップ・朱1本) | title, bars[], conceptual | データ汎用 |
| `line_compare` | 折れ線比較「追い抜き」型 | title, series | C16(ウソvs本当)。**C45で再登場(呼応の画)** |
| `thumbnail_stack` | 偽サムネZ軸フライスルー | images[7] | C01。次回以降のフック流用可 |
| `phone_feed_hesitation` | 巨大スマホ・フィード+躊躇+パンチイン | thumbs, ownThumb | C02 |
| `c012_word_growth` | (旧C12棒グラフ)**廃止予定** | — | 偽UI案に置換済み。参照しない |

再利用例(JSONだけで第3回のタイトルカードを作る):
```json
{ "type": "episode_title", "props": { "episodeNumber": "#03", "titleParts": ["おすすめ欄は、", "なぜ当たるのか"] } }
```

## B. コンポジションカタログ(Root.tsx / propsで再利用)

| Composition | 内容 | 再利用時に変えるもの |
|---|---|---|
| `EpisodeTitle` | 回タイトル(A案ブリッジ演出) | 回番号・タイトル2分割のみ。演出値は固定 |
| `C13AttentionFlow` | 視線→再生→広告費(AEマスター連携) | 単発。カウンター部品は§Cオドメーター文法として流用 |
| `C12FeedCounters` | 偽フィード+回転カウンター+数字ズーム | images/startCounts。「数字が伸びる」系カットに転用可 |
| `Ep01Thumbnail` | 実サムネ静止画(変種A/B/C+採用E) | 回ごとに構図から作り直し(煽りは第1回限定) |
| `C01SingleThumbnail` / `C01ThumbnailStackPreview` | サムネ単体/スタックのプレビュー | QA用 |
| `C02PhoneFeedPreview` / `SfxPreview` | C02プレビュー | QA用 |
| `C06GreenPhoneScreens` | グリーンバック差し替えスマホ画面 | 画面素材。実写合成の下ごしらえ汎用 |
| `PhoneCloudTransparent` | スマホ群の透過素材 | 透過素材汎用 |
| `TelopOverlay` | S2/S3/S5テロップ(カット単位透過) | テロップJSON(conte2telops.py出力)。**全回共通の納品経路** |
| `NandarouKaitai*`(6種) | アイキャッチ(長/標準/短/SE/声/完全) | 触らない(ADR-008隔離)。音声解析v1が正 |
| `RoomToneBackground` | ルームトーン背景(#0A0B0C+ビネット) | C01/C02系の背景。**透過納品時の別出し背景** |

## C. モーション文法カタログ(数値が唯一の正)

| 文法 | パラメータ | 実装箇所 | 転用の目安 |
|---|---|---|---|
| **Z軸フライスルー** | scale 420→100%・指数ease-out(出85/入15)・blur 6→0px連動・出現opacity 0→1(2F)・飛行12F(加速期は5Fまで短縮) | ThumbnailStack | 「物が視聴者を通過して着地する」全て |
| **着地オーバーシュート+沈み** | scale 100→97→100(3F)+白フラッシュ 0→.14→0(3F)+全体+3px沈み2F復帰 | ThumbnailStack | 物が「置かれる/落ちる」着地全て |
| **3段パンチイン** | 118→160→260%・各段4〜6F ease-out・シェイク±2〜3px(2F)・最終段のみ出85/入15 | PhoneFeedHesitation | 「対象に突っ込む」強調全て |
| **スクロール慣性+躊躇** | translateY指数ease-out・移動中blur 6〜8px連動・停止後「−3px戻し×2回(各2F)」 | PhoneFeedHesitation | フィード/リストを見る演出全て |
| **アンカーポイント・カメラ** | Position恒久凍結・Anchor Point=注視点・Scale=ズーム・Anchor空間補間リニア・wiggleは親ヌルのみ(0.3,2〜3) | build_c13_master.py / C12ズーム | 2Dボード上のカメラワーク全て(弧の根絶) |
| **モノクロ・スライスグリッチ** | スライス4〜6本・clip-path inset+Xオフセット−16〜+12px・opacity .45〜.55・**2Fごと再抽選**・`random(seed+floor(frame/2))`で決定論化・**RGBずらし禁止** | EpisodeTitle | Ident/EpisodeTitle世界限定(ADR-008)。本編に混ぜない |
| **ブラーイン** | blur 2px→0+opacity 0→1(10〜12F, ease-out)・位置移動なし | EpisodeTitle | 静かな出現全て(「静けさの実装」) |
| **ノンブル先行→読点2段** | 先行要素→一拍12F→前半→半拍12F→後半。BGM同期点は先頭2つのみ | EpisodeTitle | 文を「呼吸」で見せる全て |
| **HUD減衰** | グリッド.07/ラベル.30/スキャン.20→0(約44F・linear) | EpisodeTitle | アイキャッチ→本編の橋のみ |
| **オドメーターカウンター** | 固定増分配列(乱数禁止)・段階加速(F60/F120で約2倍)・tabular-nums・桁繰り上がりで転がす | C12FeedCounters / C13 | 数字が動く画全て |
| **数字→数字マッチカット** | 前カット最終Fで数字を中央・約120px相当へ→次カット冒頭の数字と位置サイズ合わせ | C12→C13 | カット間の「同一モチーフ接続」全て |
| **決定論の掟** | Math.random禁止。乱数は`random(seed)`のみ・シェイクは固定オフセット配列・再レンダー同一画をQAで確認 | 全実装共通 | — |
| **納品規約** | 23.976fps(アイキャッチのみ30fps)・カット単位書き出し・被写体=透過ProRes4444+背景別納品(`bg:'none'`)・グレイン/ビネットはPremiere側 | C01/C02実装 | 全カット共通 |

## D. スタイル資産

- **番組ルック**: `src/kit/theme.ts`(紙#E3DED1・墨#0E0F10・金茶#C9A063・朱#B8352E)+`stages.tsx`(InkStage/PaperStage)+`fonts.ts`(しっぽり明朝/Oswald/@fontsource同梱)。コンポーネント直書き禁止
- **偽UI世界**(高彩度例外): #0F0F0F・白・グレー・純黄#FFE600・純赤#E60012。番組パレットと混ぜない。ロゴ・実UI複製禁止
- **HUD世界**(Ident/EpisodeTitle限定): シアン#7EC8E3・淡#B7D9E8
- 背景素材: `RoomToneBackground` / `public/textures/paper_scan_*.jpg`

## E. 運用ルール

1. 新カット着手時: **①A表(JSONで済むか)→②B表(propsで済むか)→③C表(文法流用で済むか)**の順に確認。全部NOのときだけ拡張ループ(スタイルフレーム承認→実装→登録)
2. 新パターン追加時: 実装コミットに**本カタログへの行追加を含める**(含まないPRはレビューで差し戻し)
3. 廃止時: 行を消さず「廃止予定」と書く(c012_word_growthの例)
4. このカタログとコードが食い違ったら、**コードを直すのではなくまずYukiに報告**(どちらが正か人間が決める)

## Codexへの整備指示(1回だけの作業)

1. `src/kit/motion.ts` を新設し、§Cの共通文法をヘルパー関数として抽出: `flyThrough()` / `overshootLand()` / `punchIn()` / `inertialScroll()` / `sliceGlitch()` / `blurIn()` / `odometer()`。既存コンポーネント(ThumbnailStack・PhoneFeedHesitation・EpisodeTitle・C12FeedCounters)を段階的にこれらへ置換(見た目のピクセル一致をQA静止画で確認しながら1コンポーネントずつ)
2. `c012_word_growth` をregistryから削除し、C012WordGrowth.tsxを`archive/`へ(コンテv2で不使用のため)
3. `remotion_mg/README.md` と `使い方マニュアル.md` の型カタログ節に本カタログへの参照を追加
4. AGENTS.md §9 ドキュメント地図に本カタログの行を追加(済みでなければ)
