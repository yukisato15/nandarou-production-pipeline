import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
// フォントは自前ホスティング(@fontsource)で確定させる。
// 外部ネットワークにもOSのフォント環境にも依存しない=どの環境でも同じ字形になる。
import '@fontsource/shippori-mincho/japanese-400.css';
import '@fontsource/shippori-mincho/japanese-700.css';
import '@fontsource/shippori-mincho/japanese-800.css';
import '@fontsource/oswald/latin-400.css';
import '../styles/c13.css';

const eyeImage = staticFile('c13/eye_phone_glow.png');
const paperTexture = staticFile('textures/paper_scan_01.jpg');
const paperWhite = staticFile('textures/paper_scan_02_white.jpg');

const BOARD_W = 3840;
const BOARD_H = 2160;

type View = {
  from: number;
  to: number;
  x: number;
  y: number;
  scale: number;
};

const views: View[] = [
  {from: 0, to: 76, x: 790, y: 860, scale: 1.12},
  {from: 100, to: 163, x: 1940, y: 880, scale: 1.0},
  {from: 187, to: 214, x: 3150, y: 880, scale: 1.05},
  {from: 238, to: 312, x: 1920, y: 1080, scale: 0.5},
];

// 盤面の外(黒味)が見えないように注視点をクランプする
const clampView = (v: {x: number; y: number; scale: number}) => {
  const halfW = 960 / v.scale;
  const halfH = 540 / v.scale;
  return {
    x: Math.min(BOARD_W - halfW, Math.max(halfW, v.x)),
    y: Math.min(BOARD_H - halfH, Math.max(halfH, v.y)),
    scale: v.scale,
  };
};

const ease = (t: number) => {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
};

const getCamera = (frame: number) => {
  if (frame < views[1].from) {
    const t = ease(interpolate(frame, [views[0].to, views[1].from], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
    return clampView(mixView(views[0], views[1], t));
  }
  if (frame < views[2].from) {
    const t = ease(interpolate(frame, [views[1].to, views[2].from], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
    return clampView(mixView(views[1], views[2], t));
  }
  if (frame < views[3].from) {
    const t = ease(interpolate(frame, [views[2].to, views[3].from], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
    return clampView(mixView(views[2], views[3], t));
  }
  return clampView(views[3]);
};

const mixView = (a: View, b: View, t: number) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  scale: a.scale + (b.scale - a.scale) * t,
});

const boardTransform = (frame: number) => {
  const cam = getCamera(frame);
  const x = 960 - cam.x * cam.scale;
  const y = 540 - cam.y * cam.scale;
  return `translate(${x}px, ${y}px) scale(${cam.scale})`;
};

const lineProgress = (frame: number, start: number, end: number) => {
  return interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
};

const pop = (frame: number, at: number) => {
  return 1 + spring({frame: frame - at, fps: 23.976, config: {damping: 14, stiffness: 180, mass: 0.6}}) * 0.08;
};

const CounterCard = () => {
  const frame = useCurrentFrame();
  const value = Math.round(interpolate(frame, [108, 150], [0, 1024553], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  return (
    <div className="counter-card">
      <div className="play-triangle" />
      <div className="counter-number">{value.toLocaleString('en-US')}</div>
      <div className="counter-caption">再生回数</div>
      <div className="red-pin" />
    </div>
  );
};

const Statement = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [264, 278], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill className="m6" style={{opacity: fade}}>
      <div className="m6-text">
        <span>売られているのは、あなたの「</span>
        <span className="m6-gold">注意</span>
        <span>」です。</span>
      </div>
    </AbsoluteFill>
  );
};

const Board = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [258, 262, 266], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const line1 = lineProgress(frame, 78, 100);
  const line2 = lineProgress(frame, 164, 187);

  return (
    <div
      className="board"
      style={{
        width: BOARD_W,
        height: BOARD_H,
        transform: boardTransform(frame),
        backgroundImage: `linear-gradient(rgba(227, 222, 209, 0.72), rgba(227, 222, 209, 0.72)), url(${paperTexture})`,
      }}
    >
      <div className="paper-unit eye-unit">
        <div className="tape tape-left" />
        <div className="tape tape-right" />
        <Img className="eye-image" src={eyeImage} />
      </div>
      <div className="label label-eye">視線</div>
      <div className="sub-label sub-eye">GAZE</div>
      <Stamp className="stamp-eye" text="一" />

      <svg className="board-lines" viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}>
        <defs>
          <filter id="roughline" x="-5%" y="-30%" width="110%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" />
          </filter>
        </defs>
        {/* 線と矢印はカード手前で止める(カードの下に潜らせない) */}
        <path
          className="flow-line"
          filter="url(#roughline)"
          d="M 1060 880 C 1220 900, 1350 905, 1495 905"
          pathLength={1}
          style={{strokeDasharray: 1, strokeDashoffset: 1 - line1}}
        />
        <path
          className="flow-arrow"
          filter="url(#roughline)"
          d="M 1447 858 L 1500 905 L 1440 940"
          pathLength={1}
          style={{strokeDasharray: 1, strokeDashoffset: 1 - line1}}
        />
        <path
          className="flow-line"
          filter="url(#roughline)"
          d="M 2300 895 C 2480 915, 2620 905, 2760 900"
          pathLength={1}
          style={{strokeDasharray: 1, strokeDashoffset: 1 - line2}}
        />
        <path
          className="flow-arrow"
          filter="url(#roughline)"
          d="M 2715 852 L 2768 898 L 2708 933"
          pathLength={1}
          style={{strokeDasharray: 1, strokeDashoffset: 1 - line2}}
        />
        <path className="ledger-line" d="M 500 1520 C 1120 1550, 2170 1535, 3150 1510" />
      </svg>

      <div className="counter-wrap" style={{transform: `rotate(1.2deg) scale(${pop(frame, 107)})`}}>
        <CounterCard />
      </div>
      <div className="label label-counter">再生</div>
      <div className="sub-label sub-counter">PLAY COUNT</div>
      <Stamp className="stamp-counter" text="二" />

      <div
        className="yen-card"
        style={{
          backgroundImage: `linear-gradient(rgba(239, 234, 224, 0.88), rgba(239, 234, 224, 0.88)), url(${paperWhite})`,
          transform: `rotate(2deg) scale(${pop(frame, 188)})`,
        }}
      >
        <div className="yen-mark">¥</div>
        <div className="yen-caption">1再生 ≈ 0.1〜0.5円</div>
      </div>
      <div className="label label-yen">広告費</div>
      <div className="sub-label sub-yen">AD REVENUE</div>
      <Stamp className="stamp-yen" text="三" />

      <div className="flash" style={{opacity: flash}} />
    </div>
  );
};

const Stamp = ({className, text}: {className: string; text: string}) => {
  return <div className={`stamp ${className}`}>{text}</div>;
};

export const C13AttentionFlow = () => {
  const {width, height} = useVideoConfig();

  return (
    <AbsoluteFill className="scene" style={{width, height}}>
      <Board />
      <Statement />
    </AbsoluteFill>
  );
};
