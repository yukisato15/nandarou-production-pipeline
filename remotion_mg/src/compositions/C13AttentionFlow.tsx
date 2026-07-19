import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/noto-sans-jp/japanese-500.css';
import '@fontsource/noto-sans-jp/japanese-700.css';
import '../styles/c13.css';

/** C13: 視聴者の注意がプラットフォームを通じて広告収益になる流れ。 */
const FPS = 23.976;
const f = (s: number) => Math.round(s * FPS);
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const fast = Easing.bezier(0.16, 1, 0.3, 1);
const lerp = (frame: number, times: number[], values: number[], easing = ease) =>
  interpolate(frame, times, values, {...clamp, easing});
const fade = (frame: number, start: number, end: number) => lerp(frame, [f(start), f(end)], [0, 1], fast);

const BG = staticFile('assets/ep01/c13/background.png');
const VIEWER = staticFile('assets/ep01/c13/viewer.png');
const ADVERTISER = staticFile('assets/ep01/c13/advertiser.png');
const FINGER = staticFile('c02/finger.png');
const MONEY = staticFile('assets/ep01/c13/money_transparent.png');

const cards = [
  ['c02/feed_thumb_01.png', '考えを整理するノート'],
  ['c02/feed_thumb_02.png', 'スマホとの距離を考える'],
  ['c02/feed_thumb_03.png', '料理をつくる時間'],
  ['c02/C01_single_02.png', '年金、消える'],
  ['c02/C01_single_03.png', '知らないと損する'],
] as const;

const Label: React.FC<{children: React.ReactNode; className?: string; style?: React.CSSProperties}> = ({children, className = '', style}) => (
  <div className={`c13-label ${className}`} style={style}>{children}</div>
);

const Phone: React.FC<{frame: number}> = ({frame}) => {
  const phoneY = lerp(frame, [f(3.2), f(4.0)], [760, 0], fast);
  const feedY = frame < f(8.5)
    ? 0
    : lerp(frame, [f(8.5), f(9.8)], [0, -510], fast);
  const desat = lerp(frame, [f(11.2), f(11.8)], [0, 1], ease);
  const blue = lerp(frame, [f(11.5), f(12.2)], [0, 0.42], ease);
  const tap = lerp(frame, [f(10.1), f(10.5)], [0, 1], fast);
  const viewValue = frame < f(11.8) ? '00:00' : `00:0${Math.min(3, Math.max(0, Math.floor((frame - f(11.8)) / FPS)))}`;
  return (
    <div className="c13-phone-wrap" style={{translate: `0px ${phoneY}px`, opacity: fade(frame, 2.9, 3.2)}}>
      <div className="c13-phone">
        <div className="c13-phone-screen">
          <div className="c13-phone-topbar"><span>0:08</span><span>Ⅱ　◔　▭</span></div>
          <div className="c13-phone-feed-window">
            <div className="c13-feed-list" style={{translate: `0px ${feedY}px`, filter: `grayscale(${desat})`}}>
              {cards.map(([image, title], i) => (
                <div className="c13-feed-card" key={image}>
                  <Img src={staticFile(image)} className="c13-feed-thumb" />
                  <div className="c13-feed-meta"><span className="c13-avatar" /><div><div className="c13-feed-title">{title}</div><div className="c13-feed-sub">架空チャンネル・おすすめ</div></div></div>
                </div>
              ))}
            </div>
            <div className="c13-phone-blue" style={{opacity: blue, scale: `${0.72 + blue * 1.15}`}} />
            <div className="c13-view-timer" style={{opacity: fade(frame, 11.8, 12.1)}}><span>VIEW</span><b>{viewValue}</b></div>
            <Img src={FINGER} className="c13-finger" style={{opacity: tap, translate: `${lerp(frame, [f(10.1), f(10.5)], [110, 0], fast)}px ${lerp(frame, [f(10.1), f(10.5)], [70, 0], fast)}px`}} />
            <span className="c13-tap-ripple" style={{opacity: tap > 0.7 ? lerp(frame, [f(10.25), f(10.55)], [1, 0], ease) : 0}} />
          </div>
          <div className="c13-phone-nav"><span>⌂</span><span>◌</span><span>＋</span><span>▣</span><span>●</span></div>
        </div>
      </div>
    </div>
  );
};

const Lines: React.FC<{frame: number; viewerX: number}> = ({frame, viewerX}) => {
  // 人物が初期位置で静止した後に注視線を描く。眼球には重ねず、目の前縁から始める。
  const gaze = lerp(frame, [f(4.4), f(5.4)], [0, 1], fast);
  const fee = lerp(frame, [f(14.0), f(14.8)], [0, 1], ease);
  const revenue = lerp(frame, [f(16.0), f(16.8)], [0, 1], ease);
  // 始点は目の前（頬ではない）に置き、終点は手元スマホの手前で止める。
  const eyeX = 625 + viewerX;
  const phoneX = 870 + viewerX;
  return <svg className="c13-paths" viewBox="0 0 1920 1080" preserveAspectRatio="none">
    <defs>
      <marker id="c13-gaze-arrow" markerWidth="12" markerHeight="12" refX="10" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#7ec8e3" strokeWidth="2" /></marker>
      <marker id="c13-fee-arrow" markerWidth="14" markerHeight="14" refX="11" refY="6" orient="auto"><path d="M0,0 L11,6 L0,12" fill="none" stroke="#9bbd9a" strokeWidth="2.5" /></marker>
      <marker id="c13-revenue-arrow" markerWidth="16" markerHeight="16" refX="13" refY="7" orient="auto"><path d="M0,0 L13,7 L0,14" fill="none" stroke="#e4c45c" strokeWidth="3" /></marker>
    </defs>
    <path className="c13-gaze" d={`M${eyeX} 320 C${eyeX + 90} 300 ${phoneX - 85} 385 ${phoneX - 28} 485`} pathLength={1000} markerEnd="url(#c13-gaze-arrow)" style={{strokeDashoffset: (1 - gaze) * 1000, opacity: gaze > 0 ? 1 : 0}} />
    <path className="c13-ad-path" d="M1430 470 C1310 465 1210 460 1145 470" pathLength={1000} markerEnd="url(#c13-fee-arrow)" style={{strokeDashoffset: (1 - fee) * 1000, opacity: fee > 0 ? 1 : 0}} />
    <path className="c13-fee-path" d="M1145 610 C1270 645 1370 635 1460 600" pathLength={1000} markerEnd="url(#c13-revenue-arrow)" style={{strokeDashoffset: (1 - revenue) * 1000, opacity: revenue > 0 ? 1 : 0}} />
  </svg>;
};

const AttentionBubble: React.FC<{frame: number; left: number}> = ({frame, left}) => {
  const opacity = fade(frame, 7.5, 7.9);
  const scale = lerp(frame, [f(7.5), f(7.9)], [0.86, 1], fast);
  const jitter = frame >= f(7.5) && frame <= f(9.0) ? Math.sin(frame * 1.7) * 2 : 0;
  return <div className="c13-attention-bubble" style={{left, top: 360 + jitter, opacity, scale}}><span>注意</span></div>;
};

export const C13AttentionFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const viewerX = frame < f(0.9)
    ? lerp(frame, [f(.2), f(.9)], [-1180, 120], fast)
    : frame < f(6.2)
      ? 120
      : lerp(frame, [f(6.2), f(7.4)], [120, -200], ease);
  const viewerScale = frame < f(0.9)
    ? lerp(frame, [f(.2), f(.9)], [.92, 1.04], fast)
    : frame < f(6.2)
      ? 1.04
      : lerp(frame, [f(6.2), f(7.4)], [1.04, .92], ease);
  const viewerOpacity = fade(frame, .2, .4);
  const advertiserX = lerp(frame, [f(12.8), f(13.6)], [650, 0], fast);
  const advertiserOpacity = fade(frame, 12.8, 13.15);
  // 注視線がスマホへ到達した直後から、端末を中心に波紋をループさせる。
  // 位相をずらした3本を重ね、同じ場所で「小→大→消える」を繰り返す。
  const rippleStart = f(5.35);
  const rippleCycle = f(1.05);
  const rippleCenterX = viewerX + 870;
  const rippleCenterY = 485;
  return <AbsoluteFill className="c13-scene">
    <Img src={BG} className="c13-background" />
    <AbsoluteFill className="c13-background-shade" />
    <div className="c13-viewer-asset" style={{translate: `${viewerX}px 0px`, scale: viewerScale, opacity: viewerOpacity}}><Img src={VIEWER} /></div>
    <Phone frame={frame} />
    <div className="c13-advertiser-asset" style={{translate: `${advertiserX}px 0px`, opacity: advertiserOpacity}}><Img src={ADVERTISER} /></div>
    <Lines frame={frame} viewerX={viewerX} />
    <span className="c13-phone-focus" style={{left: viewerX + 870, top: 485, opacity: frame >= f(5.35) ? lerp(frame, [f(5.35), f(5.7)], [0, .72], fast) : 0}} />
    <div className="c13-phone-ripples" aria-hidden="true">
      {[0, 1, 2].map((index) => {
        const phaseOffset = Math.round(index * rippleCycle / 3);
        const elapsed = frame - rippleStart - phaseOffset;
        const phase = elapsed >= 0 ? (elapsed % rippleCycle) / rippleCycle : 0;
        const active = elapsed >= 0;
        return <span
          key={index}
          className="c13-phone-ripple"
          style={{
            left: rippleCenterX - 18,
            top: rippleCenterY - 18,
            opacity: active ? (1 - phase) * .62 : 0,
            scale: `${.55 + phase * 1.65}`,
          }}
        />;
      })}
    </div>
    <AttentionBubble frame={frame} left={Math.max(360, (625 + viewerX + 870 + viewerX) / 2 - 60)} />
    <Label style={{left: 100, top: 900, opacity: fade(frame, 3.1, 3.35)}}>視聴者</Label>
    <Label style={{left: 805, top: 900, opacity: fade(frame, 3.5, 3.75)}}>プラットフォーム</Label>
    <Label style={{left: 1480, top: 900, opacity: fade(frame, 12.8, 13.15)}}>広告主</Label>
    <Label className="c13-line-label c13-fee-label" style={{left: 1230, top: 432, opacity: fade(frame, 14.0, 14.3)}}>広告費</Label>
    <Label className="c13-line-label c13-revenue-label" style={{left: 1240, top: 650, opacity: fade(frame, 16.0, 16.3)}}>広告収益</Label>
    <div className="c13-money-particles">{[0, 1, 2].map((i) => {
      const t = Math.max(0, (frame - f(17.2)) / FPS);
      return <Img key={i} src={MONEY} className="c13-money-asset" style={{left: 1200 + i * 82, top: 530 + i * 28, opacity: frame >= f(17.2) ? .82 : 0, translate: `0px ${Math.sin(t * 5 + i) * 7}px`, rotate: `${Math.sin(t * 3 + i) * 4}deg`}} />;
    })}</div>
  </AbsoluteFill>;
};
