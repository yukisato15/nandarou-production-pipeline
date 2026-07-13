import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import '../kit/fonts';
import '../styles/telop-overlay.css';

type TelopStyle = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

type TelopInput = {
  style: string;
  text: string;
  motion?: string;
};

type CutInput = {
  cut: string;
  part: string;
  tc_in: string;
  tc_out: string;
  telops: TelopInput[];
};

type TelopOverlayProps = {
  cuts: CutInput[];
};

type ParsedTelop = {
  key: string;
  cut: string;
  style: TelopStyle;
  text: string;
  motion: string;
  from: number;
  duration: number;
  position: PositionName;
  offset: [number, number];
  stackIndex: number;
  maxchar?: number;
  fontSize?: number;
};

type PositionName = 'center' | 'bottom' | 'top' | 'left' | 'right';

const FPS = 23.976;
const DEFAULT_DURATION_FRAMES = Math.round(9 * 60 * FPS + 45 * FPS);
const FOLLOW_MAX = 30;
const FOLLOW_LONG_MAX = 34;
const NOTE_RE = /[（(](?:この一文のみ|タイトル|3行順次|２行順次|2行順次|一点物|画面主役)[）)]/g;

const positionMap: Record<PositionName, {left: string; top: string; transform: string}> = {
  center: {left: '50%', top: '50%', transform: 'translate(-50%, -50%)'},
  bottom: {left: '50%', top: '82%', transform: 'translate(-50%, -50%)'},
  top: {left: '50%', top: '18%', transform: 'translate(-50%, -50%)'},
  left: {left: '25%', top: '50%', transform: 'translate(-50%, -50%)'},
  right: {left: '75%', top: '50%', transform: 'translate(-50%, -50%)'},
};

export const calculateTelopOverlayMetadata = ({props}: {props: TelopOverlayProps}) => {
  const lastFrame = Math.max(
    DEFAULT_DURATION_FRAMES,
    ...props.cuts.map((cut) => timecodeToFrame(cut.tc_out))
  );
  return {durationInFrames: lastFrame};
};

export const TelopOverlay: React.FC<TelopOverlayProps> = ({cuts}) => {
  const telops = flattenTelops(cuts);

  return (
    <AbsoluteFill className="telopOverlay">
      {telops.map((telop) => (
        <Sequence key={telop.key} from={telop.from} durationInFrames={telop.duration}>
          <TimedTelop telop={telop} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const TimedTelop: React.FC<{telop: ParsedTelop}> = ({telop}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = fadeOpacity(frame, telop.duration);
  const scale = scaleForStyle(telop.style, frame, fps);
  const pos = positionMap[telop.position];
  const [offsetX, offsetY] = telop.offset;
  const text = formatText(telop.text, telop.style, telop.maxchar);

  return (
    <div
      className={`telopItem telop-${telop.style}`}
      style={{
        left: pos.left,
        top: pos.top,
        opacity,
        fontSize: telop.fontSize,
        transform: `${pos.transform} translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
      }}
      data-cut={telop.cut}
      data-motion={telop.motion}
    >
      {renderText(text, telop)}
    </div>
  );
};

const renderText = (text: string, telop: ParsedTelop) => {
  if (telop.style === 'S2' && text.includes('注意')) {
    const parts = text.split('注意');
    return (
      <>
        {parts[0]}
        <span className="telopAccent">注意</span>
        {parts.slice(1).join('注意')}
      </>
    );
  }
  return text;
};

const flattenTelops = (cuts: CutInput[]): ParsedTelop[] => {
  const result: ParsedTelop[] = [];

  cuts.forEach((cut) => {
    const from = timecodeToFrame(cut.tc_in);
    const to = timecodeToFrame(cut.tc_out);
    const cutDuration = Math.max(1, to - from);
    const nonS1Count = cut.telops.filter((t) => normalizeStyle(t.style) !== 'S1').length;

    cut.telops.forEach((telop, index) => {
      const style = normalizeStyle(telop.style);
      if (!style) {
        return;
      }
      const tags = parseMotionTags(telop.motion ?? '');
      const text = cleanTelopText(telop.text, style);
      const stackIndex = style === 'S1' ? 0 : Math.max(0, index - (cut.telops.length - nonS1Count));
      const position = resolvePosition(style, tags.position);
      const autoStackOffset = tags.hasExplicitPlacement ? 0 : stackIndex * 110;
      const offset: [number, number] = [
        style === 'S1' ? 0 : tags.offset?.[0] ?? 0,
        (style === 'S1' ? 0 : tags.offset?.[1] ?? 0) + autoStackOffset,
      ];

      result.push({
        key: `${cut.cut}_${index}_${style}`,
        cut: cut.cut,
        style,
        text,
        motion: telop.motion ?? '',
        from,
        duration: cutDuration,
        position,
        offset,
        stackIndex,
        maxchar: tags.maxchar,
        fontSize: fontSizeFor(text, style),
      });
    });
  });

  return result;
};

const timecodeToFrame = (tc: string) => {
  const [h, m, s] = tc.split(':');
  const seconds = Number(h) * 3600 + Number(m) * 60 + Number(s);
  return Math.round(seconds * FPS);
};

const normalizeStyle = (style: string): TelopStyle | null => {
  return /^S[1-6]$/.test(style) ? (style as TelopStyle) : null;
};

const defaultPosition = (style: TelopStyle): PositionName => {
  if (style === 'S1') return 'bottom';
  if (style === 'S3') return 'center';
  if (style === 'S4') return 'center';
  return 'center';
};

const resolvePosition = (style: TelopStyle, position?: PositionName): PositionName => {
  if (style === 'S1') {
    return 'bottom';
  }
  if (style === 'S2' && position === 'bottom') {
    return 'center';
  }
  return position ?? defaultPosition(style);
};

const parseMotionTags = (motion: string) => {
  const posMatch = motion.match(/\[pos:(center|left|right|top|bottom)\]/);
  const maxcharMatch = motion.match(/\[maxchar:(\d+)\]/);
  const offsetMatch = motion.match(/\[offset:\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/);
  const position = posMatch?.[1] as PositionName | undefined;

  return {
    position,
    maxchar: maxcharMatch ? Number(maxcharMatch[1]) : undefined,
    offset: offsetMatch ? ([Number(offsetMatch[1]), Number(offsetMatch[2])] as [number, number]) : undefined,
    hasExplicitPlacement: Boolean(position || offsetMatch),
  };
};

const cleanTelopText = (text: string, style: TelopStyle) => {
  const withoutInlineDirectives = style === 'S1' ? text.replace(/\+.*?(?:S[1-6]|$)/g, '') : text;
  return withoutInlineDirectives
    .replace(NOTE_RE, '')
    .replace(/《|》|★/g, '')
    .replace(/\+S1字幕でナレ全文/g, '')
    .trim();
};

const formatText = (text: string, style: TelopStyle, maxchar?: number) => {
  if (style === 'S1') {
    const limit = text.length > FOLLOW_MAX ? FOLLOW_LONG_MAX : FOLLOW_MAX;
    return lineBreak(text, maxchar ?? limit, 2);
  }
  if (style === 'S2') {
    return lineBreak(text, maxchar ?? 22, 3);
  }
  if (style === 'S4') {
    return lineBreak(text, maxchar ?? 7, 3);
  }
  return lineBreak(text, maxchar ?? 18, 3);
};

const fontSizeFor = (text: string, style: TelopStyle) => {
  if (style === 'S1') {
    return text.length > 58 ? 34 : 38;
  }
  if (style === 'S2') {
    return text.length > 26 ? 64 : 74;
  }
  return undefined;
};

const lineBreak = (text: string, max: number, maxLines: number) => {
  const normalized = text.replace(/\s+/g, '').replace(/。/g, '。\n');
  const rawLines = normalized.split('\n').filter(Boolean);
  const lines: string[] = [];

  rawLines.forEach((line) => {
    let rest = line;
    while (rest.length > max && lines.length < maxLines) {
      const splitAt = findBreak(rest, max);
      lines.push(rest.slice(0, splitAt));
      rest = rest.slice(splitAt);
    }
    if (lines.length < maxLines && rest) {
      lines.push(rest);
    }
  });

  return lines.slice(0, maxLines).join('\n');
};

const findBreak = (text: string, max: number) => {
  const preferred = Math.max(text.lastIndexOf('、', max), text.lastIndexOf('。', max));
  if (preferred > Math.floor(max * 0.45)) return preferred + 1;

  const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'も', 'へ', 'の'];
  for (let i = max; i > Math.floor(max * 0.55); i--) {
    if (particles.includes(text[i - 1])) return i;
  }
  return max;
};

const fadeOpacity = (frame: number, duration: number) => {
  const fadeIn = interpolate(frame, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [Math.max(0, duration - 10), duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.min(fadeIn, fadeOut);
};

const scaleForStyle = (style: TelopStyle, frame: number, fps: number) => {
  if (style !== 'S6') return 1;
  return 1.1 - spring({frame, fps, config: {damping: 14, stiffness: 180, mass: 0.7}}) * 0.1;
};
