import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CalculateMetadataFunction} from 'remotion';
import '../kit/fonts';
import {theme} from '../kit/theme';

// 透過テロップオーバーレイ(S2強調 / S3引用 / S5数字・欧文)。
// 入力は conte2telops.py が記法v2のコンテ表から生成した data/ep01_telops.json。
// S1=Premiere SRT / S4=statement型 / S6=画像側 / [role:*]=MG内蔵 は含まれない。

type Pos = 'center' | 'bottom' | 'top' | 'left' | 'right';

type TelopInput = {
  style: 'S2' | 'S3' | 'S5';
  text: string;
  latin?: boolean;
  emphasis?: string[];
  motion?: string;
  pos?: Pos;
  offset?: [number, number];
  maxchar?: number;
  seq?: 'stack' | 'replace';
};

type CutInput = {
  cut: string;
  part: string;
  startSec: number;
  endSec: number;
  telops: TelopInput[];
};

export type TelopDoc = {
  version: number;
  fps: number;
  parts: Record<string, {startSec: number; endSec: number}>;
  cuts: CutInput[];
};

type Props = TelopDoc & {
  part?: string; // 指定するとそのパートだけ・パート先頭を0秒として書き出す
  backdrop?: boolean; // 見本帳用の仮背景(納品movでは使わない)
};

const FADE_OUT = 10;
const STACK_STEP_FRAMES = 26; // seq:stack の行間(約1拍)

export const calculateTelopOverlayMetadata: CalculateMetadataFunction<Props> = ({props}) => {
  const win = windowFor(props);
  return {durationInFrames: Math.max(1, Math.round((win.endSec - win.startSec) * props.fps))};
};

const windowFor = (props: Props) => {
  if (props.part) {
    const p = props.parts[props.part];
    if (!p) {
      throw new Error(`パート"${props.part}"がJSONに無い。有効: ${Object.keys(props.parts).join(', ')}`);
    }
    return p;
  }
  const endSec = Math.max(...props.cuts.map((c) => c.endSec));
  return {startSec: 0, endSec};
};

export const TelopOverlay: React.FC<Props> = (props) => {
  const win = windowFor(props);
  const cuts = props.cuts.filter((c) => !props.part || c.part === props.part);

  return (
    <AbsoluteFill style={{background: 'transparent', overflow: 'hidden'}}>
      {props.backdrop ? (
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(ellipse at 50% 40%, #303236 0%, #1B1D1F 60%, #0E0F10 100%)',
          }}
        />
      ) : null}
      {cuts.map((cut) => {
        const from = Math.round((cut.startSec - win.startSec) * props.fps);
        const dur = Math.max(1, Math.round((cut.endSec - cut.startSec) * props.fps));
        return (
          <Sequence key={cut.cut} from={from} durationInFrames={dur}>
            <CutTelops cut={cut} dur={dur} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const positionMap: Record<Pos, {left: string; top: string; centered: boolean}> = {
  center: {left: '50%', top: '46%', centered: true},
  bottom: {left: '50%', top: '80%', centered: true},
  top: {left: '50%', top: '18%', centered: true},
  left: {left: '13%', top: '46%', centered: false},
  right: {left: '72%', top: '50%', centered: true},
};

const wrapperStyle = (pos: Pos, offset: [number, number]): React.CSSProperties => {
  const p = positionMap[pos];
  return {
    position: 'absolute',
    left: p.left,
    top: p.top,
    transform: `translate(${p.centered ? '-50%' : '0'}, -50%) translate(${offset[0]}px, ${offset[1]}px)`,
    width: 'max-content',
    maxWidth: 1560,
    textAlign: p.centered ? 'center' : 'left',
  };
};

const CutTelops: React.FC<{cut: CutInput; dur: number}> = ({cut, dur}) => {
  const stacked = cut.telops.filter((t) => t.seq === 'stack');
  const rest = cut.telops.filter((t) => t.seq !== 'stack');
  const n = cut.telops.length;

  return (
    <>
      {/* 縦積みグループ(順に出て、残る。既出行は少し沈む) */}
      {stacked.length > 0 ? (
        <div
          style={{
            ...wrapperStyle(stacked[0].pos ?? 'center', stacked[0].offset ?? [0, 0]),
            display: 'flex',
            flexDirection: 'column',
            gap: 52,
          }}
        >
          {stacked.map((t, i) => (
            <TelopBody
              key={i}
              t={t}
              dur={dur}
              appearDelay={8 + i * STACK_STEP_FRAMES}
              stackInfo={{i, n: stacked.length}}
            />
          ))}
        </div>
      ) : null}

      {rest.map((t, i) => {
        if (t.seq === 'replace') {
          const seg = Math.floor(dur / Math.max(1, rest.length));
          return (
            <Sequence key={i} from={i * seg} durationInFrames={seg}>
              <div style={wrapperStyle(t.pos ?? 'center', t.offset ?? [0, 0])}>
                <TelopBody t={t} dur={seg} appearDelay={0} />
              </div>
            </Sequence>
          );
        }
        // 同一カット内の非スタック複数テロップ(例: S5が2つ)は軽く縦にずらす
        const autoY = rest.length > 1 && !t.offset ? (i - (rest.length - 1) / 2) * 130 : 0;
        const [ox, oy] = t.offset ?? [0, 0];
        return (
          <div key={i} style={wrapperStyle(t.pos ?? 'center', [ox, oy + autoY])}>
            <TelopBody t={t} dur={dur} appearDelay={0} />
          </div>
        );
      })}
      {void n}
    </>
  );
};

const TelopBody: React.FC<{
  t: TelopInput;
  dur: number;
  appearDelay: number;
  stackInfo?: {i: number; n: number};
}> = ({t, dur, appearDelay, stackInfo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - appearDelay;

  // 既出行は後続が出たら少し沈める(C48規定)
  const dimmed =
    stackInfo && stackInfo.i < stackInfo.n - 1 && frame > 8 + (stackInfo.i + 1) * STACK_STEP_FRAMES + 16
      ? 0.72
      : 1;
  const fadeOut = interpolate(frame, [dur - FADE_OUT, dur - 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const baseShadow = '0 2px 10px rgba(0,0,0,0.65), 0 0 34px rgba(0,0,0,0.45)';

  if (t.style === 'S5') {
    const stamp = /スタンプ/.test(t.motion ?? '');
    const typing = /タイプ風/.test(t.motion ?? '');
    const scale = stamp
      ? 1.12 - spring({frame: Math.max(0, local), fps, config: {damping: 16, stiffness: 170, mass: 0.7}}) * 0.12
      : 1;
    const shown = typing ? t.text.slice(0, Math.max(0, Math.floor(local / 3))) : t.text;
    const inOp = typing
      ? local >= 0 ? 1 : 0
      : interpolate(local, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (
      <div
        style={{
          fontFamily: theme.fontNumber,
          fontSize: 40,
          letterSpacing: '0.22em',
          color: theme.white,
          textShadow: baseShadow,
          opacity: inOp * fadeOut * dimmed,
          transform: `scale(${scale})`,
          whiteSpace: 'pre',
        }}
      >
        {shown}
      </div>
    );
  }

  const isQuote = t.style === 'S3';
  const fontSize = fontSizeFor(t.text, isQuote, Boolean(stackInfo));
  const lines = toLines(t.text, t.maxchar ?? (isQuote ? 24 : 22));
  const chars = markEmphasis(lines.join('\n'), t.emphasis ?? []);
  const charStep = isQuote ? 0 : 2; // S2はテロップ規定の1文字2Fずらし。S3はゆっくり全体フェード
  const blockIn = isQuote
    ? interpolate(local, [0, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;

  return (
    <div
      style={{
        fontFamily: theme.fontMincho,
        fontWeight: isQuote ? 400 : 700,
        fontSize,
        letterSpacing: isQuote ? '0.14em' : '0.12em',
        lineHeight: isQuote ? 2.0 : 1.8,
        color: theme.white,
        textShadow: baseShadow,
        whiteSpace: 'pre-line',
        opacity: blockIn * fadeOut * dimmed,
      }}
    >
      {chars.map((c, i) => {
        const charIn =
          charStep === 0
            ? 1
            : interpolate(local, [10 + i * charStep, 10 + i * charStep + 8], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
        return c.ch === '\n' ? (
          <br key={i} />
        ) : (
          <span
            key={i}
            style={{
              opacity: charIn,
              color: c.emph ? theme.gold : undefined,
              fontSize: c.emph ? '1.12em' : undefined,
            }}
          >
            {c.ch}
          </span>
        );
      })}
    </div>
  );
};

const fontSizeFor = (text: string, isQuote: boolean, stacked: boolean) => {
  if (stacked) return 44;
  if (isQuote) return 50;
  if (text.length <= 14) return 66;
  if (text.length <= 24) return 58;
  return 48;
};

// 。で改行し、長い行は、や助詞で折る
const toLines = (text: string, max: number): string[] => {
  const sentences = text.split('。').filter(Boolean).map((s, i, arr) =>
    i < arr.length - 1 || text.endsWith('。') ? s + '。' : s
  );
  const lines: string[] = [];
  for (const s of sentences) {
    let rest = s;
    while (rest.length > max) {
      const at = findBreak(rest, max);
      lines.push(rest.slice(0, at));
      rest = rest.slice(at);
    }
    if (rest) lines.push(rest);
  }
  return lines;
};

const findBreak = (text: string, max: number) => {
  const comma = text.lastIndexOf('、', max);
  if (comma > Math.floor(max * 0.4)) return comma + 1;
  const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'も', 'へ', 'の'];
  for (let i = max; i > Math.floor(max * 0.5); i--) {
    if (particles.includes(text[i - 1])) return i;
  }
  return max;
};

const markEmphasis = (text: string, emphasis: string[]) => {
  const flags = new Array<boolean>(text.length).fill(false);
  for (const e of emphasis) {
    if (!e) continue;
    let idx = text.indexOf(e);
    while (idx >= 0) {
      for (let k = idx; k < idx + e.length; k++) flags[k] = true;
      idx = text.indexOf(e, idx + e.length);
    }
  }
  return [...text].map((ch, i) => ({ch, emph: flags[i]}));
};
