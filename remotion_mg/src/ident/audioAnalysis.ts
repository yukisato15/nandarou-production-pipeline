// 2026-07-16 ffprobe/ffmpeg 実測メモ。実ファイル名は日本語の支給名を使う。
export const AUDIO_FILES = {
  se: 'audio/アイキャッチジングル.wav',
  voice: 'audio/なんだろう_解体_ボイスのみ.wav',
  complete: 'audio/なんだろう解体_アイキャッチボイス入り完全版.wav',
} as const;

export const AUDIO_ANALYSIS = {
  durationSeconds: 5.5055,
  sampleRate: 48000,
  channels: 2,
  bitsPerSample: 16,
  voiceOnlyRmsDb: -26.6,
  voiceOnlyPeakDb: -4.6,
  completeRmsDb: -15.9,
  completePeakDb: 0.0,
  seRmsDb: -16.2,
  sePeakDb: 0.0,
  questionStartSeconds: 0.226312,
  questionEndSeconds: 1.686083,
  kaitaiStartSeconds: 2.578729,
  kaitaiEndSeconds: 3.031146,
} as const;
