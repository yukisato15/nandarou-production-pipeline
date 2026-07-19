import '@fontsource/noto-sans-jp/500.css';
import '@fontsource/noto-sans-jp/700.css';
import '@fontsource/oswald/500.css';
import '@fontsource/oswald/600.css';
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {theme} from '../kit/theme';

export type C22ABTestDashboardProps = {
  optionA: {label: string; image: string; ctr: number; impressions: number};
  optionB: {label: string; image: string; ctr: number; impressions: number};
  winner: 'A' | 'B';
  trialCount: number;
};

export const defaultC22ABTestDashboardProps: C22ABTestDashboardProps = {
  optionA: {label: '案 A', image: 'c01/C01_thumb_01.png', ctr: 4.8, impressions: 48240},
  optionB: {label: '案 B', image: 'c01/C01_thumb_02.png', ctr: 7.3, impressions: 49180},
  winner: 'B',
  trialCount: 97420,
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const sans = "'Noto Sans JP', sans-serif";
const formatInteger = (value: number) => Math.round(value).toLocaleString('ja-JP');

const Metric: React.FC<{label: string; value: string; accent?: boolean}> = ({label, value, accent}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
    <div
      style={{
        color: accent ? theme.red : theme.paperLight,
        fontFamily: theme.fontNumber,
        fontSize: 76,
        fontWeight: 600,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </div>
    <div style={{color: theme.ash, fontFamily: sans, fontSize: 25, letterSpacing: '0.08em'}}>{label}</div>
  </div>
);

const OptionCard: React.FC<{
  option: C22ABTestDashboardProps['optionA'];
  side: 'A' | 'B';
  winner: 'A' | 'B';
}> = ({option, side, winner}) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [6, 24], [0, 1], {...clamp, easing: ease});
  const metrics = interpolate(frame, [23, 71], [0, 1], {...clamp, easing: ease});
  const decision = interpolate(frame, [72, 92], [0, 1], {...clamp, easing: ease});
  const isWinner = winner === side;
  const opacity = reveal * (isWinner ? 1 : interpolate(decision, [0, 1], [1, 0.3], clamp));

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        gap: 18,
        opacity,
        scale: isWinner ? interpolate(decision, [0, 1], [1, 1.025], clamp) : 1,
        translate: `${(side === 'A' ? -36 : 36) * (1 - reveal)}px 0`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{color: isWinner && decision > 0.2 ? theme.red : theme.paper, fontFamily: sans, fontSize: 34, fontWeight: 700, letterSpacing: '0.12em'}}>
          {option.label}
        </div>
        <div
          style={{
            color: theme.paperLight,
            background: theme.red,
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 700,
            padding: '10px 18px',
            opacity: isWinner ? decision : 0,
          }}
        >
          選択されたデザイン
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          border: `2px solid ${isWinner && decision > 0.2 ? theme.red : 'rgba(227,222,209,0.2)'}`,
          boxShadow: isWinner ? `0 0 ${42 * decision}px rgba(184,53,46,${0.38 * decision})` : 'none',
          overflow: 'hidden',
          aspectRatio: '16 / 9',
          background: theme.ink2,
        }}
      >
        <Img src={staticFile(option.image)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28}}>
        <Metric label="クリック率" value={`${(option.ctr * metrics).toFixed(1)}%`} accent={isWinner && decision > 0.15} />
        <Metric label="表示回数" value={formatInteger(option.impressions * metrics)} />
      </div>
    </div>
  );
};

export const C22ABTestDashboard: React.FC<C22ABTestDashboardProps> = ({optionA, optionB, winner, trialCount}) => {
  const frame = useCurrentFrame();
  const intro = interpolate(frame, [0, 15], [0, 1], {...clamp, easing: ease});
  const metrics = interpolate(frame, [23, 71], [0, 1], {...clamp, easing: ease});
  const decision = interpolate(frame, [72, 92], [0, 1], {...clamp, easing: ease});
  const shutter = interpolate(frame, [101, 119], [0, 540], {...clamp, easing: Easing.inOut(Easing.quad)});

  return (
    <AbsoluteFill style={{background: theme.ink, color: theme.paper, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          opacity: 0.28,
          backgroundImage: 'linear-gradient(rgba(201,160,99,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(201,160,99,0.12) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          translate: `${interpolate(frame, [0, 120], [0, -24])}px 0`,
        }}
      />
      <div
        style={{
          position: 'relative',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          padding: '70px 92px 62px',
          gap: 28,
        }}
      >
        <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', opacity: intro}}>
          <div>
            <div style={{color: theme.gold, fontFamily: sans, fontSize: 26, fontWeight: 700, letterSpacing: '0.16em', marginBottom: 8}}>視聴者反応の比較</div>
            <div style={{fontFamily: theme.fontMincho, fontSize: 60, fontWeight: 700, letterSpacing: '0.03em'}}>サムネイル A/Bテスト</div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: sans}}>
            <div style={{color: theme.ash, fontSize: 24}}>合計表示回数</div>
            <div style={{fontFamily: theme.fontNumber, fontSize: 48, fontWeight: 500}}>{formatInteger(trialCount * metrics)}</div>
          </div>
        </div>
        <div style={{height: 2, background: theme.goldDeep}} />
        <div style={{display: 'flex', gap: 64, flex: 1, minHeight: 0}}>
          <OptionCard option={optionA} side="A" winner={winner} />
          <OptionCard option={optionB} side="B" winner={winner} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', color: theme.ash, fontFamily: sans, fontSize: 22}}>
          <span>※概念図（数値は演出用）</span>
          <span style={{color: decision > 0.4 ? theme.red : theme.ash}}>{decision > 0.4 ? '反応の差から、表示する案を決定' : '反応を計測中'}</span>
        </div>
      </div>
      <div style={{position: 'absolute', inset: '0 0 auto', height: shutter, background: theme.ink}} />
      <div style={{position: 'absolute', inset: 'auto 0 0', height: shutter, background: theme.ink}} />
    </AbsoluteFill>
  );
};
