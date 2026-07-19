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
  // 中央のプラットフォーム端末は、人物の注視線と静止を見せた後に登場させる。
  // 以前は3.2秒から出していたため、注視線より先に端末が現れていた。
  const phoneY = lerp(frame, [f(8.8), f(10.0)], [760, 0], fast);
  const feedY = frame < f(11.8)
    ? 0
    : lerp(frame, [f(11.8), f(13.4)], [0, -510], fast);
  const desat = lerp(frame, [f(14.3), f(15.0)], [0, 1], ease);
  const blue = lerp(frame, [f(14.7), f(15.5)], [0, 0.42], ease);
  const tap = lerp(frame, [f(13.8), f(14.3)], [0, 1], fast);
  // タップが完了した直後に、フィードから広告ページへ切り替える。
  // 画面全体を突然カットせず、短い退場→入場で「クリックの結果」を読ませる。
  const adTransition = lerp(frame, [f(14.45), f(15.2)], [0, 1], fast);
  const viewValue = frame < f(15.0) ? '00:00' : `00:0${Math.min(9, Math.max(0, Math.floor((frame - f(15.0)) / FPS)))}`;
  return (
    <div className="c13-phone-wrap" style={{translate: `0px ${phoneY}px`, opacity: fade(frame, 8.5, 8.8)}}>
      <div className="c13-phone">
        <div className="c13-phone-screen">
          <div className="c13-phone-topbar"><span>0:08</span><span>Ⅱ　◔　▭</span></div>
          <div className="c13-phone-feed-window">
            <div className="c13-feed-list" style={{translate: `0px ${feedY}px`, filter: `grayscale(${desat})`, opacity: 1 - adTransition}}>
              {cards.map(([image, title], i) => (
                <div className="c13-feed-card" key={image}>
                  <Img src={staticFile(image)} className="c13-feed-thumb" />
                  <div className="c13-feed-meta"><span className="c13-avatar" /><div><div className="c13-feed-title">{title}</div><div className="c13-feed-sub">架空チャンネル・おすすめ</div></div></div>
                </div>
              ))}
            </div>
            <div className="c13-ad-screen" style={{opacity: adTransition, translate: `0px ${(1 - adTransition) * 28}px`}} aria-label="架空の広告画面">
              <div className="c13-ad-screen-kicker">広告</div>
              <div className="c13-ad-screen-hero">
                <div className="c13-ad-screen-mark">暮らしを<br />整える</div>
                <div className="c13-ad-screen-orbit" />
              </div>
              <div className="c13-ad-screen-title">考える時間を、<br />もう少し。</div>
              <div className="c13-ad-screen-copy">あなたの毎日に寄り添う<br />小さな習慣のためのサービス</div>
              <div className="c13-ad-screen-cta">詳しく見る　›</div>
              <div className="c13-ad-screen-foot">SPONSORED / 架空広告</div>
            </div>
            <div className="c13-phone-blue" style={{opacity: blue, scale: `${0.72 + blue * 1.15}`}} />
            <div className="c13-view-timer" style={{opacity: fade(frame, 11.8, 12.1)}}><span>VIEW</span><b>{viewValue}</b></div>
            <Img src={FINGER} className="c13-finger" style={{opacity: tap, translate: `${lerp(frame, [f(13.8), f(14.3)], [110, 0], fast)}px ${lerp(frame, [f(13.8), f(14.3)], [70, 0], fast)}px`}} />
            <span className="c13-tap-ripple" style={{opacity: tap > 0.7 ? lerp(frame, [f(14.0), f(14.5)], [1, 0], ease) : 0}} />
          </div>
          <div className="c13-phone-nav"><span>⌂</span><span>◌</span><span>＋</span><span>▣</span><span>●</span></div>
        </div>
      </div>
    </div>
  );
};

const Lines: React.FC<{frame: number; viewerX: number}> = ({frame, viewerX}) => {
  // 人物が初期位置で静止した後に注視線を描く。眼球には重ねず、目の前縁から始める。
  const gaze = lerp(frame, [f(4.8), f(6.2)], [0, 1], fast);
  const fee = lerp(frame, [f(18.2), f(19.4)], [0, 1], ease);
  const revenue = lerp(frame, [f(21.0), f(22.4)], [0, 1], ease);
  // 始点は眼球に重ならない「目の手前の縁」。頬側へずれないよう固定する。
  // 終点は人物が持つスマホの手前。中央のプラットフォーム端末とは別座標。
  // viewer.png の実際の目の前縁（眼球に重ならない位置）に合わせる。
  // 以前の 800 は頬〜空中側にずれていたため、線が空中から出て見えていた。
  const eyeX = 640 + viewerX;
  const phoneX = 900 + viewerX;
  const gazePath = `M${eyeX} 335 C${eyeX + 115} 300 ${phoneX - 85} 390 ${phoneX - 28} 485`;
  const feePath = 'M1430 470 C1310 465 1210 460 1145 470';
  const revenuePath = 'M1145 610 C1270 645 1370 635 1460 600';
  // まず線を描き、その後に点線を走らせる。strokeDashoffset だけを
  // 動かしていた従来実装では、pathLength と dasharray の単位が噛み合わず
  // 「線が出ない／静止して見える」状態になっていた。
  const revealDash = (progress: number) => `${Math.max(0.001, progress * 1000)} 1000`;
  const movingDash = (frame: number) => -((frame * 2) % 38);
  return <svg className="c13-paths" viewBox="0 0 1920 1080" preserveAspectRatio="none">
    <defs>
      <marker id="c13-gaze-arrow" markerUnits="userSpaceOnUse" markerWidth="28" markerHeight="20" refX="24" refY="10" orient="auto"><path d="M0,0 L24,10 L0,20" fill="none" stroke="#7ec8e3" strokeWidth="3" /></marker>
      <marker id="c13-fee-arrow" markerUnits="userSpaceOnUse" markerWidth="34" markerHeight="24" refX="30" refY="12" orient="auto"><path d="M0,0 L30,12 L0,24" fill="none" stroke="#9bbd9a" strokeWidth="3" /></marker>
      <marker id="c13-revenue-arrow" markerUnits="userSpaceOnUse" markerWidth="42" markerHeight="30" refX="38" refY="15" orient="auto"><path d="M0,0 L38,15 L0,30" fill="none" stroke="#e4c45c" strokeWidth="4" /></marker>
    </defs>
    {/* 薄い下地は軌道を見失わないためだけに残し、走行する点線を主役にする */}
    <path className="c13-gaze c13-line-underlay" d={gazePath} pathLength={1000} style={{strokeDasharray: revealDash(gaze), opacity: gaze > 0 ? 0.28 : 0}} />
    <path className="c13-gaze" d={gazePath} pathLength={1000} markerEnd="url(#c13-gaze-arrow)" style={{strokeDasharray: '28 24', strokeDashoffset: movingDash(frame), opacity: gaze > .12 ? 1 : 0}} />
    <path className="c13-ad-path c13-line-underlay" d={feePath} pathLength={1000} style={{strokeDasharray: revealDash(fee), opacity: fee > 0 ? 0.28 : 0}} />
    <path className="c13-ad-path" d={feePath} pathLength={1000} markerEnd="url(#c13-fee-arrow)" style={{strokeDasharray: '28 24', strokeDashoffset: movingDash(frame), opacity: fee > .12 ? 1 : 0}} />
    <path className="c13-fee-path c13-line-underlay" d={revenuePath} pathLength={1000} style={{strokeDasharray: revealDash(revenue), opacity: revenue > 0 ? 0.28 : 0}} />
    <path className="c13-fee-path" d={revenuePath} pathLength={1000} markerEnd="url(#c13-revenue-arrow)" style={{strokeDasharray: '32 24', strokeDashoffset: movingDash(frame), opacity: revenue > .12 ? 1 : 0}} />
  </svg>;
};

const AttentionBubble: React.FC<{frame: number; left: number}> = ({frame, left}) => {
  const opacity = fade(frame, 7.8, 8.3);
  const scale = lerp(frame, [f(7.8), f(8.3)], [0.86, 1], fast);
  const jitter = frame >= f(8.3) && frame <= f(10.8) ? Math.sin(frame * 1.7) * 2 : 0;
  return <div className="c13-attention-bubble" style={{left, top: 360 + jitter, opacity, scale}}><span>注意</span></div>;
};

export const C13AttentionFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const viewerX = frame < f(0.9)
    ? lerp(frame, [f(.2), f(.9)], [-1180, 120], fast)
    : frame < f(8.0)
      ? 120
      : lerp(frame, [f(8.0), f(9.6)], [120, -200], ease);
  const viewerScale = frame < f(0.9)
    ? lerp(frame, [f(.2), f(.9)], [.92, 1.04], fast)
    : frame < f(8.0)
      ? 1.04
      : lerp(frame, [f(8.0), f(9.6)], [1.04, .92], ease);
  const viewerOpacity = fade(frame, .2, .4);
  const advertiserX = lerp(frame, [f(16.4), f(17.6)], [650, 0], fast);
  const advertiserOpacity = fade(frame, 16.4, 16.9);
  // 注視線がスマホへ到達した直後から、端末を中心に波紋をループさせる。
  // 位相をずらした3本を重ね、同じ場所で「小→大→消える」を繰り返す。
  const rippleStart = f(6.2);
  const rippleCycle = f(1.25);
  const rippleCenterX = viewerX + 900;
  const rippleCenterY = 485;
  return <AbsoluteFill className="c13-scene">
    <Img src={BG} className="c13-background" />
    <AbsoluteFill className="c13-background-shade" />
    <div className="c13-viewer-asset" style={{translate: `${viewerX}px 0px`, scale: viewerScale, opacity: viewerOpacity}}><Img src={VIEWER} /></div>
    <Phone frame={frame} />
    <div className="c13-advertiser-asset" style={{translate: `${advertiserX}px 0px`, opacity: advertiserOpacity}}><Img src={ADVERTISER} /></div>
    <Lines frame={frame} viewerX={viewerX} />
    <span className="c13-phone-focus" style={{left: viewerX + 900, top: 485, opacity: frame >= f(6.2) ? lerp(frame, [f(6.2), f(6.7)], [0, .72], fast) : 0}} />
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
    <AttentionBubble frame={frame} left={Math.max(360, (800 + viewerX + 900 + viewerX) / 2 - 60)} />
    <Label style={{left: 100, top: 900, opacity: fade(frame, 3.1, 3.35)}}>視聴者</Label>
    <Label style={{left: 805, top: 900, opacity: fade(frame, 10.0, 10.4)}}>プラットフォーム</Label>
    <Label style={{left: 1480, top: 900, opacity: fade(frame, 16.4, 16.9)}}>広告主</Label>
    <Label className="c13-line-label c13-fee-label" style={{left: 1230, top: 432, opacity: fade(frame, 18.2, 18.6)}}>広告費</Label>
    <Label className="c13-line-label c13-revenue-label" style={{left: 1240, top: 650, opacity: fade(frame, 21.0, 21.4)}}>広告収益</Label>
    <div className="c13-money-particles">{[0, 1, 2].map((i) => {
      const t = Math.max(0, (frame - f(24.0)) / FPS);
      return <Img key={i} src={MONEY} className="c13-money-asset" style={{left: 1200 + i * 82, top: 530 + i * 28, opacity: frame >= f(24.0) ? .82 : 0, translate: `0px ${Math.sin(t * 5 + i) * 7}px`, rotate: `${Math.sin(t * 3 + i) * 4}deg`}} />;
    })}</div>
  </AbsoluteFill>;
};
