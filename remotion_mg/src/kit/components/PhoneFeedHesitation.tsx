import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';

/** C02 のフィードは完成済みサムネ8枚と、本編サムネ1枚だけで構成する。 */
export const phoneFeedHesitationSchema = z.object({
  images: z.array(z.string()).min(8),
  heroImage: z.string(),
  /** v1.1: 透過納品ではステージ背景を除外する。 */
  bg: z.enum(['roomtone', 'none']).default('roomtone'),
  /**
   * 編集タイミング確認用の仮SE。納品用の透過MOVでは false のままにする。
   * 音の最終選定・音量調整はPremiere側で行う。
   */
  audioPreview: z.boolean().default(false),
});

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const interp = (frame: number, input: number[], output: number[], easing = easeOut) =>
  interpolate(frame, input, output, {...clamp, easing});

const keyframe = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, clamp);

const BellIcon: React.FC = () => (
  <div style={{position: 'relative', width: 30, height: 30}}>
    <div style={{position: 'absolute', left: 7, top: 4, width: 16, height: 19, border: '3px solid #fff', borderRadius: '12px 12px 6px 6px', borderBottom: 'none'}} />
    <div style={{position: 'absolute', left: 4, top: 22, width: 22, height: 3, borderRadius: 3, background: '#fff'}} />
    <div style={{position: 'absolute', left: 12, top: 26, width: 6, height: 4, borderRadius: 3, background: '#fff'}} />
  </div>
);

const SearchIcon: React.FC = () => (
  <div style={{position: 'relative', width: 32, height: 32}}>
    <div style={{position: 'absolute', left: 2, top: 2, width: 18, height: 18, border: '4px solid #fff', borderRadius: '50%'}} />
    <div style={{position: 'absolute', left: 19, top: 20, width: 13, height: 4, borderRadius: 3, background: '#fff', transform: 'rotate(45deg)', transformOrigin: '0 50%'}} />
  </div>
);

const YouTubeHeader: React.FC = () => (
  <div style={{height: 118, position: 'relative', background: '#080808', color: '#fff', fontFamily: "'Noto Sans JP', sans-serif"}}>
    <div style={{position: 'absolute', left: 24, top: 22, fontSize: 26, fontWeight: 700}}>0:08</div>
    <div style={{position: 'absolute', right: 22, top: 20, display: 'flex', gap: 18, alignItems: 'center'}}>
      <div style={{width: 46, height: 28, display: 'flex', alignItems: 'flex-end', gap: 4}}>{[10, 15, 21, 26].map((h, i) => <span key={h} style={{width: 6, height: h, background: i === 3 ? 'rgba(255,255,255,.45)' : '#fff', borderRadius: 2}} />)}</div>
      <div style={{width: 30, height: 25, border: '4px solid #fff', borderBottom: 0, borderRadius: '50% 50% 0 0', position: 'relative'}}><span style={{position: 'absolute', left: 8, top: 9, width: 7, height: 7, background: '#fff', borderRadius: '50%'}} /></div>
      <div style={{width: 38, height: 19, border: '3px solid #888', borderRadius: 6, position: 'relative'}}><span style={{position: 'absolute', left: 4, top: 3, width: 6, height: 11, background: '#D32222', borderRadius: 2}} /></div>
    </div>
    <div style={{position: 'absolute', left: 24, bottom: 22, display: 'flex', alignItems: 'center', gap: 12}}>
      <div style={{width: 45, height: 31, borderRadius: 8, background: '#f00', position: 'relative'}}><span style={{position: 'absolute', left: 17, top: 7, borderLeft: '13px solid #fff', borderTop: '8px solid transparent', borderBottom: '8px solid transparent'}} /></div>
      <span style={{fontSize: 25, fontWeight: 800}}>YouTube</span>
    </div>
    <div style={{position: 'absolute', right: 23, bottom: 23, display: 'flex', alignItems: 'center', gap: 17}}><BellIcon /><SearchIcon /><span style={{fontSize: 31, lineHeight: 1}}>⋮</span></div>
  </div>
);

const BottomNav: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 104, background: 'rgba(7,7,7,.98)', borderTop: '1px solid rgba(255,255,255,.1)', color: '#fff', display: 'flex', justifyContent: 'space-around', alignItems: 'center', fontFamily: "'Noto Sans JP', sans-serif", zIndex: 20}}>
    {[['⌂', 'ホーム'], ['▶', 'ショート'], ['＋', '作成'], ['▣', '登録'], ['●', 'マイページ']].map(([icon, label]) => <div key={label} style={{width: 100, textAlign: 'center', opacity: .88}}><div style={{fontSize: icon === '＋' ? 42 : 29, lineHeight: '38px'}}>{icon}</div><div style={{fontSize: 14, marginTop: 6}}>{label}</div></div>)}
  </div>
);

const channelNames = ['サンプル通信', '暮らしの記録', 'ニュース観測所', '今日の解説', '資料チャンネル', '生活メモ', '調査ノート', '静かな報道'];
const titles = ['日本、終わる', '年金、消える', '知らないと損する', '期限が迫る', '銀行が隠す真実', '老後破産', '医者は教えてくれない', 'スマホの向こう側'];

const FeedCard: React.FC<{image: string; index: number; hero?: boolean}> = ({image, index, hero}) => (
  <div style={{width: 600, marginBottom: 26, color: '#fff', fontFamily: "'Noto Sans JP', sans-serif"}}>
    <Img src={staticFile(image)} style={{display: 'block', width: 600, height: 338, objectFit: 'cover', background: '#111'}} />
    <div style={{display: 'flex', gap: 14, padding: '14px 18px 0', minHeight: 70}}>
      <div style={{width: 52, height: 52, borderRadius: '50%', flexShrink: 0, background: hero ? '#35383a' : `linear-gradient(135deg, ${index % 2 ? '#ddd' : '#c92'}, #333)`}} />
      <div style={{minWidth: 0, flex: 1}}>
        <div style={{fontSize: 23, lineHeight: 1.25, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{hero ? '『なんだろう』解体' : titles[index]}</div>
        <div style={{marginTop: 5, color: '#aaa', fontSize: 15, lineHeight: 1.35}}>{hero ? '『なんだろう』解体・1本目・今日' : `${channelNames[index]}・${index % 2 ? '98万回' : '137万回'}視聴・${index + 1}年前`}</div>
      </div>
      <div style={{fontSize: 30, lineHeight: '36px', color: '#ddd'}}>⋮</div>
    </div>
  </div>
);

const Finger: React.FC<{frame: number}> = ({frame}) => {
  // 指は冒頭から表示し、各フリック中だけ上方向へ動く。停止中は位置を固定する。
  const y = keyframe(frame, [0, 20, 32, 56, 66, 90, 100, 116], [70, 70, 330, 330, 500, 500, 680, 680]);
  const shake = frame >= 32 && frame < 56 ? keyframe(frame, [38, 40, 42, 48, 50, 52], [0, -3, 0, 0, -3, 0]) : 0;
  return <Img src={staticFile('c02/finger.png')} style={{position: 'absolute', right: -235, bottom: y + shake, width: 700, height: 394, objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.65))', zIndex: 30}} />;
};

const Stamp: React.FC<{frame: number}> = ({frame}) => {
  const scale = interp(frame, [138, 141], [2.8, 1], easeOut);
  const opacity = interp(frame, [138, 139], [0, 1]);
  // 顔・目に重ならないよう、画面右側の髪の領域へ移動する。
  return <div style={{position: 'absolute', left: 1480, top: 320, width: 240, height: 240, borderRadius: '50%', background: '#E60012', border: '10px solid #fff', boxShadow: 'inset 0 0 0 5px #E60012, inset 0 0 0 9px #fff, 0 18px 25px rgba(0,0,0,.45)', color: '#fff', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900, fontSize: 50, lineHeight: 1.08, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(-14deg) scale(${scale})`, transformOrigin: '50% 50%', opacity, zIndex: 120}}>売約<br />済</div>;
};

export const PhoneFeedHesitation: React.FC<z.infer<typeof phoneFeedHesitationSchema>> = ({images, heroImage, bg, audioPreview}) => {
  const frame = useCurrentFrame();
  const scrollY = keyframe(frame, [0, 20, 32, 56, 66, 90, 100, 116], [0, 0, -900, -900, -1650, -1650, -3350, -3350]);
  const hesitation = keyframe(frame, [38, 40, 42, 48, 50, 52], [0, -3, 0, 0, -3, 0]);
  const feedBlur = frame < 20 ? 0 : frame < 32 ? interp(frame, [20, 32], [6, 0], easeOut) : frame < 90 ? 0 : frame < 100 ? interp(frame, [90, 100], [8, 0], easeOut) : 0;
  // 3段階の「どん！」を少しゆっくり見せ、各着地の回転もわずかに強める。
  const heroPunch = frame < 116 ? 1 : frame < 122 ? interp(frame, [116, 122], [1, 1.18], easeOut) : frame < 128 ? 1.18 : frame < 134 ? interp(frame, [128, 134], [1.18, 1.6], easeOut) : frame < 140 ? 1.6 : interp(frame, [140, 148], [1.6, 2.6], easeOut);
  const punchX = keyframe(frame, [116, 119, 122, 128, 131, 134, 140, 144, 148], [0, 2, -2, 0, 2, -2, 0, -3, 0]);
  const punchY = keyframe(frame, [116, 119, 122, 128, 131, 134, 140, 144, 148], [0, -2, 2, 0, -2, 2, 0, 2, 0]);
  const punchRotate = keyframe(frame, [116, 119, 122, 128, 131, 134, 140, 144, 148], [0, 2.5, -2.5, 0, 2.5, -2.5, 0, 3.5, 0]);
  const phoneDim = interp(frame, [100, 116], [0, .22], easeOut);
  const flash = keyframe(frame, [140, 141], [.12, 0]);
  const feedImages = [...images.slice(0, 8), heroImage];

  return <AbsoluteFill style={{overflow: 'hidden', fontFamily: "'Noto Sans JP', sans-serif"}}>
    {bg === 'roomtone' ? (
      <>
        {/* v1.1: この2層は透過納品時に除外し、C01と共用の背景素材をPremiereで敷く。 */}
        <AbsoluteFill style={{background: '#0A0B0C'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 130% 100% at 50% 46%, transparent 46%, rgba(0,0,0,.34) 100%)', pointerEvents: 'none'}} />
        <AbsoluteFill style={{opacity: .09, backgroundImage: 'radial-gradient(rgba(234,230,223,.20) .65px, transparent .85px)', backgroundSize: '7px 7px', mixBlendMode: 'screen', pointerEvents: 'none'}} />
      </>
    ) : null}
    <div style={{position: 'absolute', left: 650, top: -160, width: 620, height: 1260, borderRadius: 64, background: '#030303', border: '10px solid #222', transform: 'rotate(-2deg)', transformOrigin: '50% 50%', boxShadow: '0 38px 120px rgba(0,0,0,.82)', overflow: 'hidden', zIndex: 10}}>
      <div style={{position: 'absolute', inset: 14, borderRadius: 46, background: '#080808', overflow: 'hidden'}}>
        <YouTubeHeader />
        <div style={{position: 'absolute', left: 0, right: 0, top: 118, bottom: 104, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: scrollY + hesitation, filter: `blur(${feedBlur}px)`}}>
            {feedImages.map((image, index) => <FeedCard key={`${image}-${index}`} image={image} index={index} hero={index === 8} />)}
          </div>
          <div style={{position: 'absolute', right: 8, top: interp(frame, [0, 116], [32, 430], easeInOut), width: 5, height: 110, borderRadius: 8, background: 'rgba(255,255,255,.72)', opacity: interp(frame, [0, 18, 150, 170], [0, .72, .72, 0])}} />
        </div>
        <Finger frame={frame} />
        <div style={{position: 'absolute', inset: 0, background: '#000', opacity: phoneDim, zIndex: 40, pointerEvents: 'none'}} />
        <BottomNav />
      </div>
    </div>
    <div style={{position: 'absolute', left: 660 + punchX, top: 301 + punchY, width: 600, height: 338, overflow: 'hidden', transform: `rotate(${-3.5 + punchRotate}deg) scale(${heroPunch})`, transformOrigin: '50% 50%', boxShadow: '0 54px 130px rgba(0,0,0,.82)', opacity: frame < 116 ? 0 : 1, zIndex: 100}}><Img src={staticFile(heroImage)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} /></div>
    <Stamp frame={frame} />
    <AbsoluteFill style={{background: '#fff', opacity: flash, mixBlendMode: 'screen', pointerEvents: 'none', zIndex: 140}} />
    {audioPreview ? (
      <>
        {/* 仮キュー: スクロール停止をF32/F66/F100、サムネ着地をF116、スタンプ押印をF141で確認する。 */}
        {[32, 66, 100].map((from) => (
          <Sequence key={`scroll-stop-${from}`} from={from} durationInFrames={Math.ceil(0.18 * 23.976)}>
            <Audio src={staticFile('sfx/c02_scroll_stop.wav')} volume={0.7} />
          </Sequence>
        ))}
        <Sequence from={116} durationInFrames={Math.ceil(0.34 * 23.976)}>
          <Audio src={staticFile('sfx/c01_thump.wav')} volume={0.85} />
        </Sequence>
        <Sequence from={141} durationInFrames={Math.ceil(0.34 * 23.976)}>
          <Audio src={staticFile('sfx/c01_thump.wav')} volume={0.75} />
        </Sequence>
      </>
    ) : null}
  </AbsoluteFill>;
};
