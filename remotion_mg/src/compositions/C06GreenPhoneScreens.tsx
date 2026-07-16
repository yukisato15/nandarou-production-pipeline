import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';

const THUMBS = [
  'c02/C01_single_01.png',
  'c02/C01_single_02.png',
  'c02/C01_single_03.png',
];

const TITLES = [
  '日本、終わる',
  '年金、消える',
  '知らないと損する',
];

type ScreenSpec = {
  x: number;
  width: number;
  yOffset: number;
  phase: number;
  // 1 = 下方向、-1 = 上方向。列ごとに独立して動かす。
  direction: 1 | -1;
};

const SCREEN_COLUMNS: ScreenSpec[] = [
  // 元動画は列ごとにスマホの縦位置が半段ズレている。
  // 背面フィードは緑画面の裏にだけ見えるので、少し広めに敷いて抜けを防ぐ。
  {x: 76, width: 230, yOffset: 0, phase: 0, direction: 1},
  {x: 458, width: 238, yOffset: -82, phase: 1, direction: -1},
  {x: 842, width: 238, yOffset: 0, phase: 2, direction: 1},
  {x: 1224, width: 238, yOffset: -82, phase: 0, direction: -1},
  {x: 1606, width: 238, yOffset: 0, phase: 1, direction: -1},
];

const SOURCE_REFERENCE_FRAME = 75;
const SOURCE_SCROLL_PX_PER_FRAME = 3.15;
// スマホ画面そのものの高さではなく、隣り合うスマホ画面の縦ピッチ。
// 元素材を実測すると約660px。ここを430pxにすると、端末が動くたびに
// 背面の別サムネが画面内へ入り、端末内部がスクロールして見えてしまう。
const FEED_REPEAT_HEIGHT = 660;
// 参照フレーム(75)で、1/3/5列目の最上段画面に合わせる。
const FEED_REFERENCE_TOP = 242;

const MiniFeedScreen: React.FC<{phase: number}> = ({phase}) => {
  const items = Array.from({length: 12}, (_, offset) => (phase + offset) % THUMBS.length);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#080808',
        color: '#fff',
        fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: 36,
          background: '#050505',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 19,
            borderRadius: 5,
            background: '#f00',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 11,
              top: 5,
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: '8px solid #fff',
            }}
          />
        </div>
        <div style={{fontSize: 13, fontWeight: 800, lineHeight: 1}}>YouTube</div>
        <div style={{marginLeft: 'auto', fontSize: 15, opacity: 0.82}}>⌕</div>
      </div>

      <div style={{padding: '10px 8px 0'}}>
        {items.map((item, index) => (
          <div key={`${item}-${index}`} style={{marginBottom: 12}}>
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                background: '#111',
                overflow: 'hidden',
              }}
            >
              <Img
                src={staticFile(THUMBS[item])}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
            <div style={{display: 'flex', gap: 7, paddingTop: 7}}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background:
                    item === 0
                      ? 'linear-gradient(135deg,#150000,#f00)'
                      : item === 1
                        ? 'linear-gradient(135deg,#fff,#ffe600)'
                        : 'linear-gradient(135deg,#ffe600,#f00)',
                  flexShrink: 0,
                }}
              />
              <div style={{minWidth: 0, flex: 1}}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {TITLES[item]}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    fontSize: 8,
                    lineHeight: 1,
                    color: '#aaa',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  仮動画チャンネル・おすすめ
                </div>
              </div>
              <div style={{fontSize: 14, lineHeight: '14px', opacity: 0.78}}>⋮</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FeedColumn: React.FC<{
  x: number;
  width: number;
  yOffset: number;
  phase: number;
  direction: 1 | -1;
  frame: number;
}> = ({
  x,
  width,
  yOffset,
  phase,
  direction,
  frame,
}) => {
  const repeats = Array.from({length: 9}, (_, index) => index);
  const trackY = (frame - SOURCE_REFERENCE_FRAME) * SOURCE_SCROLL_PX_PER_FRAME * direction;

  return (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: FEED_REFERENCE_TOP + yOffset + trackY,
      width,
      height: 3600,
      overflow: 'hidden',
      background: '#080808',
    }}
  >
      {repeats.map((repeat) => (
        <div
          key={repeat}
          style={{
            position: 'absolute',
            left: 0,
            top: repeat * FEED_REPEAT_HEIGHT,
            width: '100%',
            height: FEED_REPEAT_HEIGHT,
          }}
        >
          <MiniFeedScreen phase={(phase + repeat) % THUMBS.length} />
        </div>
      ))}
  </div>
  );
};

export const C06GreenPhoneScreens: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{background: '#fff', overflow: 'hidden'}}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id="c06-green-screen-key" colorInterpolationFilters="sRGB">
          {/* 緑画面だけを透明化する。背面のFeedColumnをスマホの縦移動と同期させ、
              スマホ内部ではUIが固定されて見えるようにする。 */}
          <feColorMatrix
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              5 -5 5 0 1
            "
          />
        </filter>
      </svg>
      {SCREEN_COLUMNS.map((screen) => (
        <FeedColumn
          key={`${screen.x}-${screen.phase}`}
          x={screen.x}
          width={screen.width}
          yOffset={screen.yOffset}
          phase={screen.phase}
          direction={screen.direction}
          frame={frame}
        />
      ))}
      <OffthreadVideo
        src={staticFile('C06_狂ったスマホ00001.mov')}
        muted
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'url(#c06-green-screen-key)',
        }}
      />
    </AbsoluteFill>
  );
};
