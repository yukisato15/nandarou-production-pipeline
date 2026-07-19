import {staticFile} from 'remotion';

// 番組『なんだろう』解体 デザイントークン
// ブランド定義v1.1: 低彩度・紙・墨・金茶・朱アクセント
export const theme = {
  paper: '#E3DED1',
  paperLight: '#EFEAE0',
  ink: '#0E0F10',
  ink2: '#17181A',
  gold: '#C9A063',
  goldDeep: '#A9814A',
  red: '#B8352E',
  ash: '#6E6D66',
  white: '#EAE6DF',
  hudCyan: '#7EC8E3',
  hudCyanPale: '#B7D9E8',

  fontMincho: "'Shippori Mincho', 'Hiragino Mincho ProN', serif",
  fontNumber: "Oswald, sans-serif",

  // Premiereで重ねるフォローテロップ用。主要情報はこの高さより上へ置く。
  followTelopSafeBottom: 220,

  paperTexture: staticFile('textures/paper_scan_01.jpg'),
  paperWhite: staticFile('textures/paper_scan_02_white.jpg'),
} as const;

export const seriesColor = (name: 'ink' | 'red' | 'gold'): string =>
  name === 'red' ? theme.red : name === 'gold' ? theme.goldDeep : theme.ink;
