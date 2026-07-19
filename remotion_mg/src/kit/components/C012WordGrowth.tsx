import React from 'react';
import {Img, staticFile, AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';

// C012専用の仕様値。既存の共通ステージや他カットの見た目は変更しない。
const C = {
  bg: '#111214',
  panel: '#191A1D',
  card: '#E8E4DC',
  cardDim: '#CFCAC0',
  text: '#171719',
  white: '#F1EEE8',
  red: '#C83A32',
  gold: '#D2A75C',
  ui: '#D9D5CD',
};

const cardSchema = z.object({
  headline: z.string(),
  emphasis: z.string(),
  category: z.string(),
  imagePath: z.string().optional().default(''),
  finalPosition: z.object({x: z.number(), y: z.number()}),
  entranceTime: z.number(),
  settleTime: z.number(),
});

export const c012WordGrowthSchema = z.object({
  cards: z.array(cardSchema).length(4),
  ordinaryTitle: z.string().default('日本経済と年金制度の現状'),
  kicker: z.string().default('同じテーマでも——'),
});

type Props = z.infer<typeof c012WordGrowthSchema>;
type Card = z.infer<typeof cardSchema>;

const f = (seconds: number, fps: number) => Math.round(seconds * fps);
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const cardSize = {width: 480, height: 250};

const alpha = (frame: number, start: number, end: number, from = 0, to = 1) =>
  interpolate(frame, [start, end], [from, to], {...clamp, easing: ease});

const splitHeadline = (headline: string, emphasis: string) => {
  const index = headline.indexOf(emphasis);
  if (index < 0) return {before: headline, emphasis, after: ''};
  return {
    before: headline.slice(0, index),
    emphasis,
    after: headline.slice(index + emphasis.length),
  };
};

const AbstractCard: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(135deg, ${C.card} 0%, ${C.cardDim} 100%)`,
    }}
  >
    <div style={{position: 'absolute', left: 28, right: 28, top: 34, height: 1, background: 'rgba(23,23,25,.16)'}} />
    <div style={{position: 'absolute', left: 28, right: 82, bottom: 34, height: 1, background: 'rgba(23,23,25,.12)'}} />
    <div style={{position: 'absolute', left: 28, top: 56, width: 92, height: 8, background: 'rgba(23,23,25,.12)'}} />
  </div>
);

const WarningCard: React.FC<{
  card: Card;
  frame: number;
  fps: number;
  highlight: number;
  dim: number;
}> = ({card, frame, fps, highlight, dim}) => {
  const enter = f(card.entranceTime, fps);
  const settle = f(card.settleTime, fps);
  const moveEnd = settle + f(0.3, fps);
  const local = Math.max(0, frame - enter);
  const entryT = alpha(frame, enter, enter + f(0.3, fps));
  const moveT = alpha(frame, settle, moveEnd);
  const start = {x: 1270, y: 390};
  const x = interpolate(frame, [enter, settle, moveEnd], [start.x, 560, card.finalPosition.x], {...clamp, easing: ease});
  const y = interpolate(frame, [enter, settle, moveEnd], [start.y, 360, card.finalPosition.y], {...clamp, easing: ease});
  const scale = interpolate(frame, [enter, enter + f(0.28, fps), settle, moveEnd], [1.06, 1, 1, 1], {...clamp, easing: ease});
  const rotation = interpolate(frame, [enter, settle, moveEnd], [2.5, -0.6, 0], {...clamp, easing: ease});
  const visible = frame >= enter;
  const lineProgress = alpha(frame, settle + f(0.05, fps), settle + f(0.35, fps));
  const pulse = highlight * 0.03;
  const parts = splitHeadline(card.headline, card.emphasis);
  const imageSrc = card.imagePath ? staticFile(card.imagePath) : undefined;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: cardSize.width,
        height: cardSize.height,
        opacity: visible ? Math.max(0, 1 - dim * 0.65) * (0.75 + 0.25 * entryT) : 0,
        scale: scale + pulse,
        rotate: `${rotation}deg`,
        transformOrigin: 'center center',
        overflow: 'hidden',
        border: '1px solid rgba(17,18,20,.18)',
        boxShadow: '0 16px 42px rgba(0,0,0,.24)',
      }}
    >
      {imageSrc ? (
        <Img
          src={imageSrc}
          style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) saturate(.2) brightness(.42) contrast(1.1)'}}
        />
      ) : (
        <AbstractCard />
      )}
      // 素材はカードの質感だけを借り、元サムネの文字や色は読ませない。
      <div style={{position: 'absolute', inset: 0, background: 'rgba(232,228,220,.92)'}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(232,228,220,.96), rgba(232,228,220,.84))'}} />
      <div style={{position: 'absolute', left: 30, top: 28, color: C.text, fontSize: 22, letterSpacing: '.16em', fontFamily: '"Noto Sans JP", sans-serif', fontWeight: 500}}>
        {card.category}
      </div>
      <div style={{position: 'absolute', left: 30, right: 24, top: 80, color: C.text, fontFamily: '"Shippori Mincho", serif', fontWeight: 700, fontSize: 48, lineHeight: 1.12, whiteSpace: 'nowrap'}}>
        {parts.before}<span style={{color: C.red}}>{parts.emphasis}</span>{parts.after}
      </div>
      <div style={{position: 'absolute', left: 30, top: 163, width: 250 * lineProgress, height: 5, background: C.red, transformOrigin: 'left center'}} />
      <div style={{position: 'absolute', right: 26, bottom: 24, width: 44, height: 44, borderRadius: 22, border: `2px solid ${C.red}`, opacity: .82}} />
    </div>
  );
};

const ReactionIcon: React.FC<{kind: 'click' | 'play' | 'comment'; x: number; y: number; opacity: number; scale: number; rotate: number}> = ({kind, x, y, opacity, scale, rotate}) => {
  const common = {position: 'absolute' as const, left: x, top: y, opacity, scale, rotate: `${rotate}deg`, color: C.ui};
  if (kind === 'play') return <div style={{...common, width: 44, height: 44, borderRadius: 22, border: '2px solid currentColor'}}><div style={{margin: '11px 0 0 16px', width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: `13px solid ${C.ui}`}} /></div>;
  if (kind === 'comment') return <div style={{...common, width: 48, height: 36, border: '2px solid currentColor', borderRadius: 8}}><div style={{position: 'absolute', left: 8, bottom: -8, width: 12, height: 12, borderLeft: '2px solid currentColor', transform: 'skew(-28deg)'}} /></div>;
  return <div style={{...common, width: 42, height: 42, borderRadius: 21, border: '2px solid currentColor'}}><div style={{position: 'absolute', left: 18, top: 5, width: 2, height: 28, background: C.ui, rotate: '45deg'}} /><div style={{position: 'absolute', left: 5, top: 18, width: 28, height: 2, background: C.ui, rotate: '45deg'}} /></div>;
};

const FLOW = [
  {kind: 'click' as const, from: [330, 390], to: [1390, 370], delay: 0},
  {kind: 'play' as const, from: [820, 390], to: [1510, 420], delay: 6},
  {kind: 'comment' as const, from: [330, 720], to: [1440, 470], delay: 12},
  {kind: 'click' as const, from: [820, 720], to: [1540, 510], delay: 18},
  {kind: 'play' as const, from: [500, 450], to: [1480, 570], delay: 24},
  {kind: 'comment' as const, from: [980, 550], to: [1570, 600], delay: 30},
];

export const C012WordGrowth: React.FC<Props> = ({cards, ordinaryTitle, kicker}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pulse = interpolate(frame, [f(6.3, fps), f(6.45, fps), f(6.6, fps)], [0, 1, 0], {...clamp});
  const dimCards = frame >= f(9.4, fps) ? alpha(frame, f(9.4, fps), f(10.6, fps), 0, 0.55) : 0;
  const rightVisible = alpha(frame, f(6.6, fps), f(6.9, fps));
  const lineProgress = alpha(frame, f(8.2, fps), f(8.6, fps));
  const boxProgress = alpha(frame, f(8.6, fps), f(9.0, fps));
  const boxPulse = interpolate(frame, [f(9.0, fps), f(9.2, fps), f(9.4, fps)], [1, 1.05, 1], {...clamp, easing: ease});
  const butOpacity = alpha(frame, f(9.8, fps), f(10.2, fps));
  const finalOpacity = alpha(frame, f(11.0, fps), f(11.4, fps));
  const flowOpacity = alpha(frame, f(7.0, fps), f(7.35, fps)) * (frame >= f(9.4, fps) ? 1 : 0.9);
  const lineEnd = interpolate(frame, [f(11.4, fps), f(12, fps)], [1660, 1910], {...clamp, easing: ease});
  const backdropOpacity = alpha(frame, 0, f(0.3, fps));

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, color: C.white, fontFamily: '"Shippori Mincho", serif', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, opacity: backdropOpacity, background: `radial-gradient(ellipse at 35% 48%, rgba(255,255,255,.06), transparent 55%), linear-gradient(135deg, ${C.bg}, ${C.panel})`}} />
      <div style={{position: 'absolute', inset: 0, opacity: .18, backgroundImage: 'linear-gradient(rgba(217,213,205,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(217,213,205,.06) 1px, transparent 1px)', backgroundSize: '96px 96px'}} />
      <div style={{position: 'absolute', left: 100, top: 68, opacity: alpha(frame, f(0.3, fps), f(0.6, fps)), fontSize: 28, letterSpacing: '.14em', color: C.ui}}>{kicker}</div>

      <div style={{position: 'absolute', left: 140, top: 370, width: 900, height: 410, opacity: frame < f(1.5, fps) ? 1 : interpolate(frame, [f(1.5, fps), f(1.8, fps)], [1, .12], {...clamp, easing: ease}), translate: `${interpolate(frame, [f(1.5, fps), f(1.8, fps)], [0, -70], {...clamp, easing: ease})}px 0px`, scale: interpolate(frame, [f(1.5, fps), f(1.8, fps)], [1, .94], {...clamp, easing: ease}), transformOrigin: 'center center', background: `linear-gradient(135deg, ${C.card}, ${C.cardDim})`, border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 14px 42px rgba(0,0,0,.25)'}}>
        <div style={{position: 'absolute', left: 38, top: 42, fontSize: 24, letterSpacing: '.14em', color: C.text}}>現状</div>
        <div style={{position: 'absolute', left: 38, top: 112, fontSize: 48, fontWeight: 700, color: C.text, whiteSpace: 'nowrap'}}>{ordinaryTitle}</div>
        <div style={{position: 'absolute', left: 38, right: 38, bottom: 46, height: 1, background: 'rgba(23,23,25,.15)'}} />
      </div>

      {cards.map((card) => <WarningCard key={card.category} card={card} frame={frame} fps={fps} highlight={pulse} dim={dimCards} />)}

      <div style={{position: 'absolute', left: 1220, top: 300, opacity: rightVisible, color: C.ui, fontSize: 30, letterSpacing: '.22em'}}>反応</div>
      {FLOW.map((item, i) => {
        const start = f(7.0, fps) + item.delay;
        const end = start + f(.75, fps);
        const t = alpha(frame, start, end);
        const x = interpolate(frame, [start, end], [item.from[0], item.to[0]], {...clamp, easing: ease});
        const y = interpolate(frame, [start, end], [item.from[1], item.to[1]], {...clamp, easing: ease});
        const r = Math.sin((frame + i * 13) / 8) * 3;
        return <ReactionIcon key={i} kind={item.kind} x={x} y={y} opacity={flowOpacity * t} scale={1 + .04 * pulse} rotate={r} />;
      })}
      <div style={{position: 'absolute', left: 1220, top: 520, width: 320 * lineProgress, height: 2, background: C.gold, transformOrigin: 'left center'}} />
      <div style={{position: 'absolute', left: 1430, top: 555, width: 280, height: 96, opacity: boxProgress, scale: boxPulse, border: `2px solid ${C.gold}`, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, letterSpacing: '.12em', transformOrigin: 'center center'}}>視聴時間</div>
      <div style={{position: 'absolute', left: 100, bottom: 100, opacity: butOpacity * (1 - finalOpacity), fontSize: 48, letterSpacing: '.12em'}}>でも——</div>
      <div style={{position: 'absolute', left: 100, right: 100, bottom: 96, height: 2, width: lineEnd - 100, background: C.gold, opacity: alpha(frame, f(11.4, fps), f(11.8, fps))}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', opacity: finalOpacity, fontSize: 58, letterSpacing: '.12em', color: C.white}}>売られるのは、不安そのものではない。</div>
    </AbsoluteFill>
  );
};

export const defaultC012Props: Props = {
  ordinaryTitle: '日本経済と年金制度の現状',
  kicker: '同じテーマでも——',
  cards: [
    {headline: '経済が終わる', emphasis: '終わる', category: '破局', imagePath: 'c01/C01_thumb_01.png', finalPosition: {x: 120, y: 260}, entranceTime: 1.8, settleTime: 2.5},
    {headline: '年金、消える', emphasis: '消える', category: '喪失', imagePath: 'c01/C01_thumb_02.png', finalPosition: {x: 650, y: 260}, entranceTime: 2.8, settleTime: 3.5},
    {headline: '知らないと、損する', emphasis: '損する', category: '損失', imagePath: 'c01/C01_thumb_03.png', finalPosition: {x: 120, y: 590}, entranceTime: 3.8, settleTime: 4.5},
    {headline: '銀行が隠す真実', emphasis: '隠す真実', category: '秘密', imagePath: 'c01/C01_thumb_04.png', finalPosition: {x: 650, y: 590}, entranceTime: 4.8, settleTime: 5.5},
  ],
};
