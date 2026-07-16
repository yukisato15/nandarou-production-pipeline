import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import '@fontsource/shippori-mincho/japanese-700.css';
import '@fontsource/noto-sans-jp/japanese-500.css';
import '@fontsource/noto-sans-jp/japanese-700.css';
import {theme} from '../theme';

/** EpisodeTitleの入力。デザイン値はpropsにせず、このコンポーネントの仕様を正本にする。 */
export const episodeTitleSchema = z.object({
  episodeNumber: z.string(),
  titleParts: z.tuple([z.string(), z.string()]),
  hudLabelTL: z.string().optional().default('ANALYSIS MODE'),
  hudLabelBR: z.string().optional().default('EP-01'),
});

type EpisodeTitleProps = z.infer<typeof episodeTitleSchema>;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const linear = (frame: number, range: [number, number], values: [number, number]) =>
  interpolate(frame, range, values, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.linear,
  });

const easeOut = (frame: number, range: [number, number]) =>
  interpolate(frame, range, [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

const NoiseGrain: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      backgroundImage: 'radial-gradient(rgba(234,230,223,0.18) 0.7px, transparent 0.9px)',
      backgroundSize: '8px 8px',
      opacity: 0.09,
    }}
  />
);

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 46%, transparent 52%, rgba(14,15,16,0.28) 100%)',
    }}
  />
);

const ResidualHud: React.FC<{frame: number; labelTL: string; labelBR: string}> = ({
  frame,
  labelTL,
  labelBR,
}) => {
  const gridOpacity = linear(frame, [26, 70], [0.07, 0]);
  const labelOpacity = linear(frame, [26, 70], [0.3, 0]);
  const scanOpacity = linear(frame, [26, 70], [0.2, 0]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(126,200,227,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(126,200,227,0.05) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          opacity: gridOpacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 58,
          top: 54,
          color: '#C8CDD1',
          fontFamily: 'monospace',
          fontSize: 17,
          letterSpacing: '0.18em',
          opacity: labelOpacity,
        }}
      >
        {labelTL} <span style={{color: theme.hudCyan}}>▪</span>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 58,
          bottom: 54,
          color: '#C8CDD1',
          fontFamily: 'monospace',
          fontSize: 17,
          letterSpacing: '0.18em',
          opacity: labelOpacity,
        }}
      >
        {labelBR} <span style={{color: theme.hudCyan}}>▪</span>
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0 1px, transparent 1px 3px)',
          opacity: scanOpacity,
        }}
      />
    </AbsoluteFill>
  );
};

type GlitchTextProps = {
  frame: number;
  text: string;
  className?: string;
  style?: React.CSSProperties;
  start: number;
  duration: number;
  sliceCount: number;
  sliceStrength: number;
  children?: React.ReactNode;
};

/** 水平スライスだけで復元するモノクロのグリッチ文字。乱数は2F単位で固定。 */
const GlitchText: React.FC<GlitchTextProps> = ({
  frame,
  text,
  style,
  start,
  duration,
  sliceCount,
  sliceStrength,
  children,
}) => {
  const progress = easeOut(frame, [start, start + duration]);
  const sliceProgress = clamp((frame - start) / duration);
  const blur = (1 - progress) * 2;
  const colors = ['#FFFFFF', '#8A9094', '#C6CBCE', '#FFFFFF'];
  return (
    <span style={{position: 'relative', display: 'inline-block', opacity: progress, filter: `blur(${blur}px)`, ...style}}>
      <span>{children ?? text}</span>
      {Array.from({length: sliceCount}, (_, i) => {
        const bucket = Math.floor(frame / 2);
        const jitter = random(`episode-title-${text}-${i}-${bucket}`);
        const offset = (jitter - 0.5) * sliceStrength;
        const top = (i / sliceCount) * 100;
        const bottom = 100 - ((i + 1) / sliceCount) * 100;
        return (
          <span
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: `inset(${top}% 0 ${bottom}% 0)`,
              transform: `translateX(${offset * (1 - sliceProgress)}px)`,
              opacity: 0.45 + (i % 2) * 0.1,
              color: colors[i % colors.length],
              pointerEvents: 'none',
            }}
          >
            {children ?? text}
          </span>
        );
      })}
    </span>
  );
};

const JitterSlices: React.FC<{frame: number; children: React.ReactNode}> = ({frame, children}) => {
  const active = frame >= 38 && frame <= 42 ? 1 : frame >= 60 && frame <= 64 ? 1 : 0;
  if (!active) return <>{children}</>;
  const bucket = Math.floor(frame / 2);
  const x = (random(`episode-title-jitter-${bucket}`) - 0.5) * 10;
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      {children}
      <span aria-hidden="true" style={{position: 'absolute', inset: 0, clipPath: 'inset(30% 0 30% 0)', transform: `translateX(${x}px)`, opacity: 0.38, color: '#8A9094'}}>
        {children}
      </span>
    </span>
  );
};

export const EpisodeTitle: React.FC<EpisodeTitleProps> = (rawProps) => {
  const props = episodeTitleSchema.parse(rawProps);
  const frame = useCurrentFrame();
  const hud = <ResidualHud frame={frame} labelTL={props.hudLabelTL} labelBR={props.hudLabelBR} />;
  const numberFade = linear(frame, [124, 136], [1, 0]);
  const titleFade = linear(frame, [124, 136], [1, 0]);
  const first = props.titleParts[0];
  const second = props.titleParts[1];

  return (
    <AbsoluteFill style={{backgroundColor: '#0E0F10', overflow: 'hidden'}}>
      <NoiseGrain />
      <Vignette />
      {hud}
      <div style={{position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', textAlign: 'center', color: '#EAE6DF'}}>
        <div style={{marginBottom: 64, color: '#B7D9E8', fontFamily: 'Oswald, sans-serif', fontSize: 52, letterSpacing: '0.42em', marginLeft: '0.42em', opacity: numberFade}}>
          <GlitchText frame={frame} text={props.episodeNumber} start={14} duration={8} sliceCount={4} sliceStrength={28}>
            {props.episodeNumber}
          </GlitchText>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', fontFamily: "'Shippori Mincho', serif", fontSize: 92, fontWeight: 700, letterSpacing: '0.2em', marginLeft: '0.2em', whiteSpace: 'nowrap', opacity: titleFade}}>
          <JitterSlices frame={frame}>
            <GlitchText frame={frame} text={first} start={38} duration={10} sliceCount={2} sliceStrength={10}>{first}</GlitchText>
          </JitterSlices>
          <JitterSlices frame={frame}>
            <GlitchText frame={frame} text={second} start={60} duration={10} sliceCount={2} sliceStrength={10}>{second}</GlitchText>
          </JitterSlices>
        </div>
      </div>
    </AbsoluteFill>
  );
};
