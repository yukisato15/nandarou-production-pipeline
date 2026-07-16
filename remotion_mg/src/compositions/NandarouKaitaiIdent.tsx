import React, {useEffect, useRef} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/noto-sans-jp/japanese-500.css';
import '@fontsource/noto-sans-jp/japanese-700.css';
import '@fontsource/shippori-mincho/japanese-400.css';
import '@fontsource/shippori-mincho/japanese-700.css';
import {AUDIO_FILES} from '../ident/audioAnalysis';
import {IDENT_DURATION_FRAMES, LONG_TIMING, SHORT_TIMING, STANDARD_TIMING, type IdentTiming} from '../ident/timing';

export type IdentAudioMode = 'complete' | 'stems' | 'se-only' | 'voice-only';
export type IdentVariant = 'long' | 'standard' | 'short';

export type NandarouKaitaiProps = {
  questionText: string;
  actionText: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  glitchIntensity: number;
  hudIntensity: number;
  showHud: boolean;
  showFadeOut: boolean;
  showVoice: boolean;
  showSe: boolean;
  audioMode: IdentAudioMode;
  seSrc: string;
  voiceSrc: string;
  completeSrc: string;
  seVolume: number;
  voiceVolume: number;
  masterVolume: number;
  variant: IdentVariant;
};

export const defaultIdentProps: NandarouKaitaiProps = {
  questionText: 'なんだろう',
  actionText: '解体',
  backgroundColor: '#050608',
  textColor: '#F2F2F0',
  accentColor: '#68E8FF',
  fontFamily: "'Shippori Mincho', serif",
  glitchIntensity: 0.6,
  hudIntensity: 0.45,
  showHud: true,
  showFadeOut: false,
  showVoice: true,
  showSe: true,
  audioMode: 'complete',
  seSrc: AUDIO_FILES.se,
  voiceSrc: AUDIO_FILES.voice,
  completeSrc: AUDIO_FILES.complete,
  seVolume: 1,
  voiceVolume: 1,
  masterVolume: 1,
  variant: 'long',
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => Easing.inOut(Easing.cubic)(clamp01(v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const glyphOffsets = [
  {x: 210, y: 750, size: 230, rotation: -14, opacity: 0.76, blur: 1.5, xAmp: 48, yAmp: 30, phase: 0.4},
  {x: 1540, y: 260, size: 128, rotation: 17, opacity: 0.52, blur: 3, xAmp: 28, yAmp: 52, phase: 1.7},
  {x: 1330, y: 710, size: 290, rotation: -7, opacity: 0.64, blur: 4, xAmp: 65, yAmp: 24, phase: 2.8},
  {x: 340, y: 230, size: 104, rotation: 11, opacity: 0.43, blur: 2, xAmp: 35, yAmp: 41, phase: 3.9},
  {x: 1650, y: 790, size: 184, rotation: -18, opacity: 0.69, blur: 1, xAmp: 54, yAmp: 36, phase: 5.1},
] as const;

// Math.random()を使わず、フレームとインデックスから同じ値を再現する。
const seeded = (index: number, frame: number) => {
  const value = Math.sin(index * 91.17 + frame * 17.31) * 43758.5453;
  return value - Math.floor(value);
};

const GridAndFrame: React.FC<{frame: number; color: string}> = ({frame, color}) => {
  const drift = (frame * 0.35) % 48;
  return (
    <AbsoluteFill style={{opacity: 0.22, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 20, border: `1px solid ${color}`, opacity: 0.42}} />
      <div style={{position: 'absolute', inset: 20, backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: '48px 48px', backgroundPosition: `${drift}px ${drift}px`, opacity: 0.11}} />
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 760, height: 760, border: `1px solid ${color}`, borderRadius: '50%', transform: 'translate(-50%, -50%)', opacity: 0.22}} />
      <div style={{position: 'absolute', left: '50%', top: 20, bottom: 20, width: 1, background: color, opacity: 0.16}} />
      <div style={{position: 'absolute', top: '50%', left: 20, right: 20, height: 1, background: color, opacity: 0.16}} />
    </AbsoluteFill>
  );
};

const BurstField: React.FC<{frame: number; intensity: number; color: string}> = ({frame, intensity, color}) => {
  const burst = interpolate(frame, [75, 81, 83, 87], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * intensity;
  if (burst <= 0.01) return null;
  const blocks = Array.from({length: 220}, (_, i) => {
    const x = seeded(i, 3) * 1920;
    const y = seeded(i, 7) * 1080;
    const w = 3 + seeded(i, 11) * (38 + burst * 110);
    const h = 1 + seeded(i, 13) * (2 + burst * 8);
    const hue = i % 3 === 0 ? '#FF3D54' : i % 3 === 1 ? '#68E8FF' : '#F2F2F0';
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: w, height: h, background: hue, opacity: burst * (0.2 + seeded(i, frame) * 0.75), transform: `translateX(${(seeded(i, frame) - 0.5) * 36 * burst}px)`}} />;
  });
  const slices = Array.from({length: 32}, (_, i) => <div key={`s${i}`} style={{position: 'absolute', left: 40 + seeded(i, 19) * 1500, top: 120 + seeded(i, 23) * 820, width: 120 + seeded(i, 29) * 520, height: 2 + seeded(i, 31) * 14, background: i % 2 ? color : '#FF3D54', opacity: burst * 0.7, transform: `translateX(${(seeded(i, frame + 100) - 0.5) * 240}px)`}} />);
  return <AbsoluteFill style={{mixBlendMode: 'screen', opacity: burst, pointerEvents: 'none'}}>{blocks}{slices}<div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, transparent 0 14%, rgba(104,232,255,${0.18 * burst}) 15%, transparent 34%)`}} /></AbsoluteFill>;
};

const PixelNoiseCanvas: React.FC<{frame: number}> = ({frame}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const amount = interpolate(frame, [78, 83, 87], [0, 0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || amount <= 0.01) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = 192;
    const height = 108;
    canvas.width = width;
    canvas.height = height;
    const image = ctx.createImageData(width, height);
    for (let i = 0; i < image.data.length; i += 4) {
      const n = Math.floor(seeded(i / 4, frame) * 255);
      image.data[i] = n;
      image.data[i + 1] = n;
      image.data[i + 2] = n;
      image.data[i + 3] = Math.floor(amount * 180);
    }
    ctx.putImageData(image, 0, 0);
  }, [amount, frame]);
  return <canvas ref={ref} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: amount * 0.42, mixBlendMode: 'screen', imageRendering: 'pixelated', pointerEvents: 'none'}} />;
};

const BlockNoiseLayer: React.FC<{frame: number}> = ({frame}) => {
  const amount = interpolate(frame, [76, 81, 84, 87], [0, 1, 0.75, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (amount <= 0.01) return null;
  return <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: amount * 0.7}}>{Array.from({length: 48}, (_, i) => <div key={i} style={{position: 'absolute', left: seeded(i, 101) * 1840, top: seeded(i, 103) * 1020, width: 12 + seeded(i, 107) * 180, height: 6 + seeded(i, 109) * 70, background: i % 3 === 0 ? '#FF3048' : i % 3 === 1 ? '#68E8FF' : '#F2F2F0', opacity: 0.18 + seeded(i, frame) * 0.6, transform: `translate(${(seeded(i, frame + 11) - 0.5) * 120}px, ${(seeded(i, frame + 17) - 0.5) * 40}px)`}} />)}</AbsoluteFill>;
};

const ChromaticAberrationLayer: React.FC<{frame: number}> = ({frame}) => {
  const amount = interpolate(frame, [79, 83, 87], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (amount <= 0.01) return null;
  return <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: amount * 0.5}}>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,0,40,.22), transparent 35%, transparent 65%, rgba(0,220,255,.22))', transform: `translateX(${-28 * amount}px)`}} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,220,255,.18), transparent 35%, transparent 65%, rgba(255,0,40,.18))', transform: `translateX(${28 * amount}px)`}} />
  </AbsoluteFill>;
};

// v3で分離したグリッチ要素。すべて75〜87Fの短い区間だけ稼働する。
const RgbSplitLayer: React.FC<{frame: number}> = ({frame}) => {
  const t = interpolate(frame, [75, 81, 87], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (t <= 0) return null;
  return <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: t}}><div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,30,60,.12), transparent 40%, rgba(70,235,255,.14))', transform: `translateX(${t * 22}px)`}} /></AbsoluteFill>;
};

const HorizontalSliceLayer: React.FC<{frame: number; color: string}> = ({frame, color}) => {
  const amount = interpolate(frame, [75, 81, 87], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (amount <= 0) return null;
  const bands = 7 + Math.round(amount * 9);
  return <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: amount * 0.8}}>{Array.from({length: bands}, (_, i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 180 + i * (720 / bands), height: 2 + (i % 3) * 2, background: i % 2 ? color : '#FF3D54', transform: `translateX(${(seeded(i, frame) - 0.5) * 240 * amount}px)`}} />)}</AbsoluteFill>;
};

const VerticalSliceLayer: React.FC<{frame: number}> = ({frame}) => {
  const amount = interpolate(frame, [78, 83, 87], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (amount <= 0) return null;
  return <AbsoluteFill style={{pointerEvents: 'none', opacity: amount * 0.45}}>{Array.from({length: 5}, (_, i) => <div key={i} style={{position: 'absolute', top: 0, bottom: 0, left: 240 + i * 360, width: 2, background: '#68E8FF', transform: `translateX(${(seeded(i, frame) - .5) * 90 * amount}px)`}} />)}</AbsoluteFill>;
};

const ScanLineLayer: React.FC<{frame: number; color: string}> = ({frame, color}) => {
  const y = interpolate(frame, [42, 48], [0, 1080], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = frame >= 42 && frame <= 48 ? 0.7 : frame >= 70 && frame <= 72 ? 0.45 : 0;
  return opacity > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 2, background: color, opacity, boxShadow: `0 0 12px ${color}`, pointerEvents: 'none'}} /> : null;
};

const GlitchFlashLayer: React.FC<{frame: number}> = ({frame}) => {
  const opacity = frame === 75 ? 0.22 : frame === 83 ? 0.28 : frame === 84 ? 0.12 : 0;
  return opacity > 0 ? <AbsoluteFill style={{background: '#F2FFFF', opacity, pointerEvents: 'none'}} /> : null;
};

const SignalDropLayer: React.FC<{frame: number}> = ({frame}) => frame === 27 || frame === 75 ? <AbsoluteFill style={{background: '#000', opacity: 0.18, pointerEvents: 'none'}} /> : null;

const TextFragmentLayer: React.FC<{frame: number; text: string; color: string; finalShift?: number; firstCharRef?: React.RefObject<HTMLSpanElement>}> = ({frame, text, color, finalShift = 0, firstCharRef}) => {
  const t = interpolate(frame, [89, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (frame < 89) return null;
  const glitch = 1 - t;
  const bands = glitch > 0 ? (frame <= 95 ? 12 : frame <= 97 ? 6 : 2) : 0;
  const blocks = frame <= 95 ? 20 : frame <= 98 ? 4 : 0;
  // 最終画では右括弧との間隔を28–38pxに収めるため、解体ブロックを少し右へ。
  return <div style={{position: 'absolute', left: `calc(50% + ${418 + finalShift}px)`, top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', gap: 8, color, fontSize: 136, fontWeight: 900, letterSpacing: 3, pointerEvents: 'none', whiteSpace: 'nowrap'}}>
    {Array.from(text).map((c, i) => <span ref={i === 0 ? firstCharRef : undefined} key={i} style={{position: 'relative', transform: `translate(${(seeded(i, frame) - .5) * glitch * 150}px, ${(seeded(i + 8, frame) - .5) * glitch * 34 + (frame === 90 ? 8 : 0)}px)`, clipPath: `inset(${seeded(i + 15, frame) * glitch * 70}% 0 ${seeded(i + 21, frame) * glitch * 65}% 0)`, textShadow: glitch > 0 ? `${-34 * glitch}px 0 #FF3048, ${38 * glitch}px 0 #68E8FF` : '0 0 4px rgba(97,234,244,.42)'}}>{c}</span>)}
    {Array.from({length: bands}, (_, i) => <i key={`b${i}`} style={{position: 'absolute', left: -80 + seeded(i, 30) * 320, top: -250 + i * 24, width: 260 + seeded(i, 31) * 220, height: 3 + (i % 3) * 2, background: i % 2 ? '#68E8FF' : '#FF3048', transform: `translateX(${(seeded(i, frame + 41) - .5) * (glitch * 180 + 20)}px)`, opacity: 0.7}} />)}
    {Array.from({length: blocks}, (_, i) => <i key={`n${i}`} style={{position: 'absolute', left: seeded(i, 60) * 260, top: -170 + seeded(i, 61) * 250, width: 12 + seeded(i, 62) * 60, height: 5 + seeded(i, 63) * 18, background: '#050608', opacity: 0.9}} />)}
  </div>;
};

const AudioLayer: React.FC<NandarouKaitaiProps> = (p) => {
  if (p.audioMode === 'complete') return <Audio src={staticFile(p.completeSrc)} volume={p.masterVolume} />;
  if (p.audioMode === 'se-only') return p.showSe ? <Audio src={staticFile(p.seSrc)} volume={p.seVolume * p.masterVolume} /> : null;
  if (p.audioMode === 'voice-only') return p.showVoice ? <Audio src={staticFile(p.voiceSrc)} volume={p.voiceVolume * p.masterVolume} /> : null;
  return (
    <>
      {p.showSe && <Audio src={staticFile(p.seSrc)} volume={p.seVolume * p.masterVolume} />}
      {p.showVoice && <Audio src={staticFile(p.voiceSrc)} volume={p.voiceVolume * p.masterVolume} />}
    </>
  );
};

const Hud: React.FC<{frame: number; intensity: number; color: string}> = ({frame, intensity, color}) => {
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.31);
  const sceneOpacity = interpolate(frame, [0, 10, 42, 77, 92, 112], [0.22, 0.34, 0.5, 0.85, 0.45, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = intensity * sceneOpacity * (0.72 + pulse * 0.2);
  if (opacity <= 0.001) return null;
  return (
    <AbsoluteFill style={{opacity, color, fontFamily: 'monospace', fontSize: 18, letterSpacing: 2, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 150, top: 176}}>ANALYSIS MODE　<span style={{color}}>■</span></div>
      <div style={{position: 'absolute', right: 170, top: 208, textAlign: 'right'}}>STRUCTURE SCAN<br/><span style={{fontSize: 13}}>00{String(Math.max(0, frame - 77)).padStart(2, '0')} / LOCK</span></div>
      <div style={{position: 'absolute', left: 150, top: 224, lineHeight: 1.75, opacity: 0.8}}>SIGNAL SEARCH...<br/>QUESTION IDENTIFIED<br/>STRUCTURE PROBING...</div>
      <div style={{position: 'absolute', left: 150, right: 150, top: 214, height: 1, background: color, opacity: 0.45}} />
      <div style={{position: 'absolute', left: 150, bottom: 150, width: `${Math.min(100, Math.max(0, (frame - 77) * 4))}%`, height: 2, background: color, opacity: 0.5}} />
      <div style={{position: 'absolute', right: 150, bottom: 142, fontSize: 14}}>再構成 / SIGNAL LOCK</div>
      <div style={{position: 'absolute', right: 150, top: 176}}>SYS-01　LOG-287</div>
    </AbsoluteFill>
  );
};

const FinalHud: React.FC<{frame: number; color: string}> = ({frame, color}) => {
  // 最終HUDは114Fで突然出さず、冒頭から薄く存在させて解析の進行に合わせて復元する。
  const reveal = interpolate(frame, [0, 28, 62, 78, 94], [0.08, 0.12, 0.18, 0.55, 0.78], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glitch = interpolate(frame, [70, 78, 92, 100], [0, 1, 0.35, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const clip = interpolate(frame, [0, 70, 94], [100, 100, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{pointerEvents: 'none', color: '#E8F2F2', fontFamily: 'monospace', fontSize: 16, letterSpacing: 1.5, opacity: reveal, clipPath: `inset(0 ${clip}% 0 0)`, filter: `blur(${glitch * 0.7}px)`, textShadow: glitch > 0 ? `${-glitch * 4}px 0 rgba(255,48,72,.5), ${glitch * 4}px 0 rgba(104,232,255,.5)` : 'none'}}>
    <div style={{position: 'absolute', left: 58, top: 54}}>ANALYSIS MODE <span style={{color}}>■</span><div style={{marginTop: 18, lineHeight: 1.8, opacity: 0.85}}>ANALYSIS COMPLETE<br/>QUESTION RECONSTRUCTED<br/>STRUCTURE IDENTIFIED<br/><span style={{color}}>SYS STATUS : NORMAL</span></div></div>
    <div style={{position: 'absolute', right: 58, top: 54, textAlign: 'right'}}>SYS-01　LOG-287 <span style={{color}}>■</span><div style={{marginTop: 18, lineHeight: 1.8, opacity: 0.85}}>00:00:03:12<br/>+　+　+　+　+</div></div>
    <div style={{position: 'absolute', left: 58, bottom: 54, lineHeight: 1.8}}>SIGNAL LOCK <span style={{color}}>■</span><br/><span style={{color}}>〰〰〰〰〰〰〰〰</span><br/>FREQ. 328.77 Hz</div>
    <div style={{position: 'absolute', right: 58, bottom: 54, textAlign: 'right'}}>DATA STREAM <span style={{color}}>■</span><br/><span style={{color}}>■■■■■■■■■■■■■■</span><br/>RESOLUTION　3840×2160<br/>FRAME RATE　30.00 FPS</div>
  </AbsoluteFill>;
};

export const NandarouKaitaiIdent: React.FC<NandarouKaitaiProps> = (props) => {
  const p = {...defaultIdentProps, ...props};
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const timing: IdentTiming = p.variant === 'short' ? SHORT_TIMING : p.variant === 'standard' ? STANDARD_TIMING : LONG_TIMING;
  const fade = 1;
  const questionChars = Array.from(p.questionText);
  // 最終ロゴの目標座標は全フレームで共通。114Fで別レイアウトへジャンプさせない。
  const finalShift = -18;
  const baseX = 592;
  const leftQuoteRef = useRef<HTMLSpanElement>(null);
  const rightQuoteRef = useRef<HTMLSpanElement>(null);
  const firstQuestionRef = useRef<HTMLSpanElement>(null);
  const lastQuestionRef = useRef<HTMLSpanElement>(null);
  const firstActionRef = useRef<HTMLSpanElement>(null);
  const measuredRef = useRef(false);
  const glitchPulse = interpolate(frame, [77, 79, 84, 88], [0, p.glitchIntensity, p.glitchIntensity * 0.7, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  useEffect(() => {
    if (frame !== 164 || measuredRef.current) return;
    const lq = leftQuoteRef.current?.getBoundingClientRect();
    const rq = rightQuoteRef.current?.getBoundingClientRect();
    const first = firstQuestionRef.current?.getBoundingClientRect();
    const last = lastQuestionRef.current?.getBoundingClientRect();
    const action = firstActionRef.current?.getBoundingClientRect();
    if (!lq || !rq || !first || !last || !action) return;
    measuredRef.current = true;
    // Remotion CLIでも確認できるようstderrへ出力する（Studioでは通常のConsoleにも表示）。
    console.error(`[v6 bbox] LeftQuote → な = ${(first.left - lq.right).toFixed(2)} px`);
    console.error(`[v6 bbox] う → RightQuote = ${(rq.left - last.right).toFixed(2)} px`);
    console.error(`[v6 bbox] RightQuote → 解 = ${(action.left - rq.right).toFixed(2)} px`);
  }, [frame]);

  return (
    <AbsoluteFill style={{backgroundColor: p.backgroundColor, color: p.textColor, fontFamily: p.fontFamily, opacity: fade, overflow: 'hidden'}}>
      <AudioLayer {...p} />
      <GridAndFrame frame={frame} color={p.accentColor} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 48%, rgba(38,54,66,0.18), transparent 58%)'}} />
      {p.showHud && <Hud frame={frame} intensity={p.hudIntensity} color={p.accentColor} />}
      <BurstField frame={frame} intensity={p.glitchIntensity} color={p.accentColor} />
      <SignalDropLayer frame={frame} />
      <ScanLineLayer frame={frame} color={p.accentColor} />
      <RgbSplitLayer frame={frame} />
      <HorizontalSliceLayer frame={frame} color={p.accentColor} />
      <VerticalSliceLayer frame={frame} />
      <BlockNoiseLayer frame={frame} />
      <PixelNoiseCanvas frame={frame} />
      <ChromaticAberrationLayer frame={frame} />
      <GlitchFlashLayer frame={frame} />

      {/* 問い。最初は個別の文字として浮遊し、音声の後半で中央へ吸着する。 */}
      <AbsoluteFill>
        {questionChars.map((char, i) => {
          const g = glyphOffsets[i % glyphOffsets.length];
          const appear = smooth(interpolate(frame, [3 + i * 3, 15 + i * 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
          const collect = smooth(interpolate(frame, [75 + i * 1.2, 87 + i * 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
          const driftX = Math.sin(frame * (0.035 + i * 0.006) + g.phase) * g.xAmp + Math.sin(frame * 0.09 + g.phase * 2) * 11;
          const driftY = Math.cos(frame * (0.026 + i * 0.004) + g.phase) * g.yAmp + Math.sin(frame * 0.075 + g.phase) * 9;
          const x0 = g.x + driftX;
          const y0 = g.y + driftY;
          const targetX = baseX + i * 105;
          const targetY = height / 2;
          const x = lerp(x0, targetX, collect);
          const y = lerp(y0, targetY, collect);
          const op = appear * lerp(g.opacity, 1, collect);
          const blur = lerp(g.blur, 0.5, collect);
          const rotation = lerp(g.rotation + Math.sin(frame * 0.03 + g.phase) * 4, 0, collect);
          const size = lerp(g.size, 112, collect);
          const rgb = glitchPulse > 0 ? ` ${glitchPulse * 12}px 0 rgba(255,40,70,${glitchPulse * 0.65}), ${-glitchPulse * 12}px 0 rgba(104,232,255,${glitchPulse * 0.65})` : '';
          return <span ref={i === 0 ? firstQuestionRef : i === questionChars.length - 1 ? lastQuestionRef : undefined} key={`${char}-${i}`} style={{position: 'absolute', left: x, top: y, fontSize: size, fontWeight: 500, transform: `translate(-50%, -50%) rotate(${rotation}deg)`, opacity: op, filter: `blur(${blur}px)`, textShadow: rgb, whiteSpace: 'nowrap'}}>{char}</span>;
        })}
      </AbsoluteFill>

      {/* 解体。ノイズ→断片→RGB分裂→水平スライス→復元の順で現れる。 */}
      <TextFragmentLayer frame={frame} text={p.actionText} color="#D8FAFF" finalShift={finalShift} firstCharRef={firstActionRef} />

      {/* 括弧も最初から存在する同一要素。88Fからクリップで復元する。 */}
      <span ref={leftQuoteRef} style={{position: 'absolute', left: 433 + finalShift, top: height / 2 - 61, fontFamily: "'Shippori Mincho', serif", fontSize: 101, fontWeight: 500, color: '#EBF1EF', letterSpacing: 2, clipPath: `inset(0 ${frame < 88 ? 100 : Math.max(0, 100 - (frame - 88) * 8)}% 0 0)`, whiteSpace: 'nowrap'}}>『</span>
      <span ref={rightQuoteRef} style={{position: 'absolute', left: 1104 + finalShift, top: height / 2 - 61, fontFamily: "'Shippori Mincho', serif", fontSize: 101, fontWeight: 500, color: '#EBF1EF', letterSpacing: 2, clipPath: `inset(0 0 0 ${frame < 88 ? 100 : Math.max(0, 100 - (frame - 88) * 8)}%)`, whiteSpace: 'nowrap'}}>』</span>
      <FinalHud frame={frame} color={p.accentColor} />
      {(() => {
        // 下部テキストはOpacityだけで出さず、クリップ解除・短いブラー・RGB分裂を併用する。
        const reveal = interpolate(frame, [70, 78, 94, 104], [0, 0.25, 1, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const glitch = interpolate(frame, [70, 78, 94, 104], [1, 1, 0.25, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const clip = interpolate(frame, [70, 94], [100, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return <div style={{position: 'absolute', left: 0, right: 0, top: height / 2 + 112, textAlign: 'center', color: '#E8F2F2', fontFamily: "'Shippori Mincho', serif", fontSize: 24, letterSpacing: 12, fontWeight: 500, opacity: reveal, clipPath: `inset(0 ${clip}% 0 0)`, filter: `blur(${glitch * 2}px)`, textShadow: glitch > 0 ? `${-glitch * 5}px 0 rgba(255,48,72,.5), ${glitch * 5}px 0 rgba(104,232,255,.5)` : 'none'}}>問いを解き、構造を見抜く</div>;
      })()}
      {glitchPulse > 0 && <>
        <div style={{position: 'absolute', left: 0, right: 0, top: height / 2 - 2, height: 2, background: p.accentColor, opacity: glitchPulse * 0.75, transform: `translateX(${(frame % 2 ? 1 : -1) * 18}px)`}} />
        <div style={{position: 'absolute', inset: 0, background: '#F2F2F0', opacity: glitchPulse * 0.08}} />
      </>}
      <div style={{position: 'absolute', left: 150, right: 150, bottom: 92, height: 1, background: p.textColor, opacity: 0.12}} />
    </AbsoluteFill>
  );
};

export {IDENT_DURATION_FRAMES};
