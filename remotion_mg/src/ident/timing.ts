// アイキャッチ音声の実測値を30fpsへ換算したタイミング。
// 「音声を聞いた印象」で数字を決めず、voice-only/complete WAVの解析結果を基準にする。
export const IDENT_FPS = 30;
export const IDENT_DURATION_SECONDS = 5.5055;
export const IDENT_DURATION_FRAMES = 165; // 5.50秒。最終フレームは164。

export type IdentTiming = {
  duration: number;
  ambientStart: number;
  questionVoiceStart: number;
  questionVoiceEnd: number;
  kaitaiVoiceStart: number;
  kaitaiVoiceEnd: number;
  hudStart: number;
  assemblyStart: number;
  assemblyEnd: number;
  finalTitleStart: number;
  fadeOutStart: number;
};

// voice-only の無音区間: 0–0.226312s / 1.686083–2.578729s /
// 2.777917–2.835167s / 3.031146–5.5055s。
export const LONG_TIMING: IdentTiming = {
  duration: IDENT_DURATION_FRAMES,
  ambientStart: 1,
  questionVoiceStart: 7,
  questionVoiceEnd: 51,
  kaitaiVoiceStart: 77,
  kaitaiVoiceEnd: 91,
  hudStart: 77,
  assemblyStart: 77,
  assemblyEnd: 92,
  finalTitleStart: 108,
  fadeOutStart: 165,
};

// 現在の支給音源は5.5055秒版のみ。3バージョンとも音声を途中で切らず、
// variantは映像密度だけを変える。短縮音源が支給された時点でここを差し替える。
export const STANDARD_TIMING = LONG_TIMING;
export const SHORT_TIMING = LONG_TIMING;
