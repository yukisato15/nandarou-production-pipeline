import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import '@fontsource/noto-sans-jp/japanese-900.css';
import '@fontsource/noto-sans-jp/japanese-700.css';

// 第1回の本体サムネイル(1280x720静止画)。
//
// 方針:
// - C01で使った3枚の「偽サムネ」とは別の、第4の煽り文法にする。
// - 既存3枚の黒赤・白黄・純黄赤を避け、夜スマホの青黒/深紫/シアン光で作る。
// - 人物素材は切り抜きのみ使用。背景・コピー・売約済シール・光はRemotion側で合成する。
// - サムネなので番組本編の落ち着いたトーンより強く、クリックベイトの文法を意図的に使う。

export type Ep01ThumbnailProps = {
  variant: 'A' | 'B' | 'C';
};

const FONT = "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif";
const CYAN = '#55E8FF';
const PURPLE = '#7B3CFF';
const RED = '#E60012';
const YELLOW = '#FFE600';
const WHITE = '#FFFFFF';
const BLACK = '#03040A';

const StrokeText: React.FC<{
  children: React.ReactNode;
  size: number;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}> = ({children, size, color = WHITE, stroke = BLACK, strokeWidth, style}) => {
  const sw = strokeWidth ?? Math.max(7, Math.round(size * 0.08));
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: '-0.045em',
        color,
        WebkitTextStroke: `${sw}px ${stroke}`,
        paintOrder: 'stroke fill',
        textShadow: '0 8px 20px rgba(0,0,0,0.68), 0 0 26px rgba(85,232,255,0.35)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const SoldSticker: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div
    style={{
      position: 'absolute',
      width: 178,
      height: 178,
      borderRadius: '50%',
      border: '9px solid #fff',
      background: RED,
      transform: 'rotate(-13deg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 12px 30px rgba(0,0,0,0.55), 0 0 34px rgba(230,0,18,0.65)',
      ...style,
    }}
  >
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 42,
        lineHeight: 1.04,
        color: '#fff',
        textAlign: 'center',
        letterSpacing: '-0.04em',
      }}
    >
      売約
      <br />
      済
    </div>
  </div>
);

const PhoneGlow = () => (
  <>
    <div
      style={{
        position: 'absolute',
        right: 46,
        bottom: -36,
        width: 430,
        height: 180,
        borderRadius: 34,
        background: 'linear-gradient(180deg, rgba(160,244,255,0.95), rgba(50,110,255,0.22))',
        filter: 'blur(30px)',
        opacity: 0.82,
        transform: 'rotate(-7deg)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: 72,
        bottom: -22,
        width: 360,
        height: 122,
        borderRadius: 28,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.90), rgba(83,226,255,0.62) 55%, rgba(78,69,255,0.20))',
        boxShadow: '0 0 36px rgba(85,232,255,0.7), inset 0 0 30px rgba(255,255,255,0.42)',
        transform: 'rotate(-7deg)',
      }}
    />
  </>
);

const Background = () => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(circle at 80% 52%, rgba(85,232,255,0.24) 0%, rgba(49,22,116,0.24) 24%, rgba(3,4,10,0) 54%), radial-gradient(circle at 12% 16%, rgba(123,60,255,0.40) 0%, rgba(16,11,39,0.55) 32%, rgba(3,4,10,0) 58%), linear-gradient(135deg, #04050D 0%, #09071D 46%, #04030B 100%)',
      overflow: 'hidden',
    }}
  >
    {/* 画面奥のスマホUI/監視感を出す抽象ライン。文字は入れない。 */}
    <svg viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, opacity: 0.36}}>
      <defs>
        <linearGradient id="gridLine" x1="0" x2="1">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0" />
          <stop offset="50%" stopColor={CYAN} stopOpacity="0.75" />
          <stop offset="100%" stopColor={PURPLE} stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({length: 9}).map((_, i) => (
        <path
          key={`h-${i}`}
          d={`M ${60 + i * 18} ${82 + i * 62} C 310 ${64 + i * 18}, 680 ${120 + i * 48}, 1228 ${70 + i * 67}`}
          stroke="url(#gridLine)"
          strokeWidth="2"
          fill="none"
        />
      ))}
      {Array.from({length: 8}).map((_, i) => (
        <circle key={`c-${i}`} cx={104 + i * 138} cy={106 + ((i * 73) % 460)} r={4 + (i % 3) * 2} fill={CYAN} opacity="0.55" />
      ))}
    </svg>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 54%, rgba(0,0,0,0.76) 100%)',
      }}
    />
  </AbsoluteFill>
);

const VariantA = () => (
  <AbsoluteFill>
    <Background />
    <PhoneGlow />
    <Img
      src={staticFile('c01/ep01_main_woman_cutout.png')}
      style={{
        position: 'absolute',
        right: -132,
        bottom: -18,
        height: 770,
        filter:
          'contrast(1.12) saturate(1.08) drop-shadow(0 0 34px rgba(85,232,255,0.34)) drop-shadow(-34px 24px 42px rgba(0,0,0,0.78))',
      }} />
    <SoldSticker style={{right: 210, top: 112}} />
    <div style={{position: 'absolute', left: 126, top: 58}}>
      <div
        style={{
          display: 'inline-block',
          background: RED,
          color: WHITE,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 34,
          padding: '8px 24px 10px',
          transform: 'rotate(-2deg)',
          boxShadow: '0 8px 22px rgba(0,0,0,0.45)',
        }}
      >
        知らない間に
      </div>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 68,
        top: 176,
        width: 760,
        textAlign: 'center',
        transform: 'rotate(-2deg)',
      }}
    >
      <StrokeText size={104} style={{textAlign: 'center'}}>あなた、</StrokeText>
      <StrokeText size={144} color={CYAN} stroke="#001018" style={{marginTop: 10, textAlign: 'center'}}>
        売られてます
      </StrokeText>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 118,
        bottom: 54,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 48,
        color: YELLOW,
        WebkitTextStroke: '6px #08040A',
        paintOrder: 'stroke fill',
        textShadow: '0 0 20px rgba(255,230,0,0.48)',
        transform: 'rotate(-1deg)',
      }}
    >
      ※しかも、毎日
    </div>
  </AbsoluteFill>
);

const VariantB = () => (
  <AbsoluteFill>
    <Background />
    <PhoneGlow />
    <Img
      src={staticFile('c01/ep01_main_woman_cutout.png')}
      style={{
        position: 'absolute',
        right: -176,
        bottom: -22,
        height: 790,
        filter: 'contrast(1.18) saturate(1.08) drop-shadow(0 0 44px rgba(85,232,255,0.45))',
      }}
    />
    <SoldSticker style={{right: 212, top: 86, width: 168, height: 168}} />
    <div style={{position: 'absolute', left: 66, top: 90, width: 720, textAlign: 'center'}}>
      <StrokeText size={88} style={{textAlign: 'center'}}>あなたの</StrokeText>
      <StrokeText size={150} color={CYAN} stroke="#001018" style={{marginTop: 10, textAlign: 'center'}}>
        注意が
      </StrokeText>
      <StrokeText size={102} color={WHITE} style={{marginTop: 20, textAlign: 'center'}}>
        売られてます
      </StrokeText>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 116,
        bottom: 48,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 43,
        color: YELLOW,
        WebkitTextStroke: '5px #08040A',
        paintOrder: 'stroke fill',
      }}
    >
      ※スマホを見るたびに
    </div>
  </AbsoluteFill>
);

const VariantC = () => (
  <AbsoluteFill>
    <Background />
    <PhoneGlow />
    <Img
      src={staticFile('c01/ep01_main_woman_cutout.png')}
      style={{
        position: 'absolute',
        right: -126,
        bottom: -30,
        height: 780,
        filter: 'contrast(1.14) saturate(1.05) drop-shadow(0 0 36px rgba(85,232,255,0.42))',
      }}
    />
    <SoldSticker style={{right: 224, top: 112}} />
    <div
      style={{
        position: 'absolute',
        left: 70,
        top: 100,
        width: 720,
        textAlign: 'center',
        transform: 'rotate(-2deg)',
      }}
    >
      <StrokeText size={90} style={{textAlign: 'center'}}>そのクリック、</StrokeText>
      <StrokeText size={150} color={CYAN} stroke="#001018" style={{marginTop: 16, textAlign: 'center'}}>
        売約済
      </StrokeText>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 92,
        bottom: 54,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 46,
        color: YELLOW,
        WebkitTextStroke: '5px #08040A',
        paintOrder: 'stroke fill',
      }}
    >
      ※あなたの注意が商品です
    </div>
  </AbsoluteFill>
);

export const Ep01Thumbnail: React.FC<Ep01ThumbnailProps> = ({variant}) => {
  if (variant === 'B') return <VariantB />;
  if (variant === 'C') return <VariantC />;
  return <VariantA />;
};
