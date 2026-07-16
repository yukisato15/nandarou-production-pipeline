# アイキャッチ音声素材

アイキャッチ用の音声ファイルをこのフォルダに置きます。

```text
ident-se.wav       # SE・アンビエント・グリッチ・収束音のみ
ident-voice.wav    # 「なんだろう」「解体」のボイスのみ
ident-complete.wav # SEとボイスをミックスした完成版
```

3ファイルは同じ開始位置・同じ尺で揃えてください。
Remotionでは次のように参照します。

```tsx
<Audio src={staticFile('audio/ident-complete.wav')} />
```

`public/audio/` に置いたファイルは、`staticFile('audio/ファイル名')` で読み込めます。
