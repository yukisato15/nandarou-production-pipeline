import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  interpolateColors,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import '@fontsource/noto-sans-jp/japanese-500.css';

const BG = '#0F0F0F';
const WHITE = '#F4F4F4';
const MUTED = '#A6A6A6';
const YELLOW = '#FFE600';

export const c12FeedCountersSchema = z.object({
  images: z.array(z.string()).length(6),
  startCounts: z.array(z.number().int().nonnegative()).length(6),
  durationInFrames: z.number().int().positive().optional().default(264),
});

type Props = z.infer<typeof c12FeedCountersSchema>;

const GRID = {
  // 3列×480px + 2つの40px間隔 = 1520px。1920px幅の中央に置くと左端は200px。
  left: 200,
  top: 58,
  thumbW: 480,
  thumbH: 270,
  colGap: 40,
  rowGap: 34,
  metaH: 105,
};

const META = [
  ['架空速報通信', '・3日前'],
  ['暮らしのメモ帳', '・1週間前'],
  ['サンプル経済局', '・5日前'],
  ['生活の検証室', '・2日前'],
  ['話題の観測所', '・3日前'],
  ['匿名データ通信', '・6日前'],
];

// 非煽りサムネイル4枚は、写真素材の上に静かな説明タイトルを重ねる。
// C01の煽りサムネイル2枚は既存PNGをそのまま使用する。
const CALM_THUMBNAIL_TITLES: Record<number, string> = {
  1: '考えを整理するノート',
  2: 'スマホとの距離を考える',
  3: '料理をつくる時間',
  4: '食べることを見つめる',
};

// 煽りサムネイル（セル1・セル6）だけが急伸する。
// 非煽りサムネイルは低い初期値からゆっくり増え、黄色化もしない。
const ACCELERATED = [0, 5];
const MICRO_INCREMENT = [5, 2, 3, 1, 2, 4];
const ACCEL_INCREMENT = [40, 80];

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const zoomEase = Easing.bezier(0.15, 0.9, 0.35, 1);
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const counterValue = (base: number, frame: number, index: number) => {
  const local = Math.max(0, Math.min(frame, 200));
  if (!ACCELERATED.includes(index)) return base + local * MICRO_INCREMENT[index];
  const rate = ACCEL_INCREMENT[ACCELERATED.indexOf(index)];
  if (local <= 60) return base + local * rate;
  if (local <= 120) return base + 60 * rate + (local - 60) * rate * 2;
  return base + 60 * rate + 60 * rate * 2 + (local - 120) * rate * 4;
};

const Counter: React.FC<{value: number; accelerated: boolean; frame: number; colorT: number}> = ({value, accelerated, frame, colorT}) => {
  const color = interpolateColors(colorT, [0, 1], [WHITE, YELLOW]);
  return (
    <span style={{fontFamily: '"Noto Sans JP", sans-serif', fontSize: 32, fontWeight: 500, color, letterSpacing: '.02em', whiteSpace: 'nowrap'}}>
      <span style={{fontVariantNumeric: 'tabular-nums'}}>{value.toLocaleString('en-US')}</span>{' '}<span style={{fontSize: 24}}>回視聴</span>
    </span>
  );
};

const Cell: React.FC<{image: string; startCount: number; index: number; frame: number; opacity: number; zooming: boolean}> = ({image, startCount, index, frame, opacity, zooming}) => {
  const [channel, date] = META[index];
  const value = counterValue(startCount, frame, index);
  const accelerated = ACCELERATED.includes(index);
  const yellowT = accelerated ? interpolate(frame, [60, 72], [0, 1], {...clamp}) : 0;
  const col = index % 3;
  const row = Math.floor(index / 3);
  const left = GRID.left + col * (GRID.thumbW + GRID.colGap);
  const top = GRID.top + row * (GRID.thumbH + GRID.metaH + GRID.rowGap);
  return (
    <div style={{position: 'absolute', left, top, width: GRID.thumbW, opacity}}>
      <div style={{width: GRID.thumbW, height: GRID.thumbH, overflow: 'hidden', borderRadius: 12, background: '#202020'}}>
        <Img src={staticFile(image)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        {CALM_THUMBNAIL_TITLES[index] ? (
          <div style={{position: 'absolute', left: 22, top: 20, right: 22, color: '#F7F4EE', textShadow: '0 2px 10px rgba(0,0,0,.42)', fontFamily: '"Noto Sans JP", sans-serif', fontWeight: 500, fontSize: 30, lineHeight: 1.25, letterSpacing: '.04em'}}>
            {CALM_THUMBNAIL_TITLES[index]}
          </div>
        ) : null}
      </div>
      <div style={{height: GRID.metaH, paddingTop: 15, color: WHITE, fontFamily: '"Noto Sans JP", sans-serif', fontSize: 24, lineHeight: 1.35}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12}}>
          <span style={{whiteSpace: 'nowrap'}}>{channel}</span>
          <Counter value={value} accelerated={accelerated} frame={frame} colorT={yellowT} />
        </div>
        <div style={{color: MUTED, fontSize: 20, marginTop: 5}}>{date}</div>
      </div>
    </div>
  );
};

export const C12FeedCounters: React.FC<Props> = ({images, startCounts}) => {
  const frame = useCurrentFrame();
  const gridOpacity = interpolate(frame, [0, 10], [0, 1], {...clamp, easing: easeOut});
  const dimOthers = interpolate(frame, [170, 190], [1, 0.9], {...clamp, easing: easeOut});
  const zoomProgress = interpolate(frame, [200, 264], [0, 1], {...clamp, easing: zoomEase});
  const scale = interpolate(frame, [200, 264], [1, 3], {...clamp, easing: zoomEase});
  // セル1のカウンター中心。スケール中もこの点を画面中央に固定する。
  const counterFocusX = GRID.left + GRID.thumbW / 2;
  const counterFocusY = GRID.top + GRID.thumbH + 42;
  // Keep the grid at its normal origin until F200. During the final push-in,
  // interpolate the camera translation to place the counter at screen centre.
  const translateX = (960 - counterFocusX * 3) * zoomProgress;
  const translateY = (540 - counterFocusY * 3) * zoomProgress;
  const shake = frame >= 200 ? Math.sin(frame * 0.8) * interpolate(frame, [200, 264], [0, 1.5], {...clamp}) : 0;
  const isZooming = frame >= 200;

  return (
    <AbsoluteFill style={{backgroundColor: BG, color: WHITE, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0F0F0F 0%, #121212 100%)'}} />
      <div style={{position: 'absolute', inset: 0, opacity: gridOpacity, transform: `translate(${translateX + shake}px, ${translateY}px) scale(${scale})`, transformOrigin: '0 0'}}>
        {images.map((image, index) => <Cell key={`${image}-${index}`} image={image} startCount={startCounts[index]} index={index} frame={frame} opacity={index === 0 ? 1 : dimOthers} zooming={isZooming} />)}
      </div>
      <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 48%, transparent 45%, rgba(0,0,0,.34) 100%)`}} />
    </AbsoluteFill>
  );
};

export const defaultC12FeedCountersProps: Props = {
  images: [
    'c01/C01_thumb_01.png',
    'c01/C01_quiet_notebook.png',
    'c01/C01_quiet_smartphone.png',
    'c01/C01_quiet_chef.png',
    'c01/C01_quiet_meal.png',
    'c01/C01_thumb_05.png',
  ],
  // 非煽り系は100〜500程度から開始し、264F内でも概ね1000以下に留める。
  startCounts: [1247832, 120, 300, 80, 500, 54209],
  durationInFrames: 264,
};
