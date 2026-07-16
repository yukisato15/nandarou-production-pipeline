# Workflow

## 制作フロー

```text
台本（人間承認）
  → コンテ表（Excel）
  → tools/conte2srt.py / tools/conte2telops.py / tools/conte2mg.py
  → SRT・テロップJSON・シーンJSON
  → Remotion Studioで確認
  → Remotionで素材レンダー
  → Premiereで実写・音・字幕・素材を合成
```

## 素材から完成まで

1. Excelの「コンテ」シートを編集する。テロップは記法v2（`S2/本文`など）、位置・演出はモーション列タグで記述する。
2. `validate_telops.py`で記法違反を止める。
3. `tools/conte2srt.py`でS1 SRTを生成する。23.976fps、既定5.5字/秒を使う。
4. `conte2telops.py`でS2/S3/S5のRemotion入力JSONを生成する。S1/S4/S6は別経路へ送る。
5. `data/*.json`を`JsonScenes`へ渡す。`registry.tsx`のZod schemaに合わなければ停止する。
6. `npm run dev`でStudioを開き、静止画・モーション・可読性を確認する。
7. `render_telops_per_cut.sh`でカット単位の透過ProResを作る。各ファイルは0秒始まりで、Premiereの実カットへ置く。
8. Premiereで実写、SRT、透過テロップ、MG、音楽、SEを編集し、最終尺を決める。

## Premiereとの連携

コンテのTC目安は確定タイムコードではない。したがってテロップをパート全体の絶対時間で書き出さない。SRTはPremiereへ読み込み、テロップはカット単位のProResを該当カットに置く。Premiereが最終的な尺・同期・音・呼吸の判断場所である。

## Remotionの役割

1. **情報カット生成**: JSON→登録済み型（グラフ、引用、宣言、タイトルなど）。
2. **資料モンタージュ編集台**: 実写・静止画・紙・数字・注釈をコードで合成する設計段階の領域。
3. **テロップ素材生成**: S2/S3/S5の透過オーバーレイ。
4. **アイキャッチ/単発演出**: `NandarouKaitaiIdent`やC13など、専用Composition。

## AIの役割分担

- **Claude/GPT**: 台本・コンテの壁打ち、JSON生成、設計レビュー。出典や判断が必要な内容は人間へ戻す。
- **Codex**: リポジトリ内のコード・検証・ドキュメント・レンダーを実行する実装担当。
- **人間**: 台本の最終稿、スタイルフレーム承認、素材権利、Premiereの最終編集。

AI間で引き継ぐときは、このフォルダと`AGENTS.md`を先に読み、`git status`と実際のコードを確認する。
