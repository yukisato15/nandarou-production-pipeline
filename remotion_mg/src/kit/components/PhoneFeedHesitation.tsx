import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {z} from 'zod';

export const phoneFeedHesitationSchema = z.object({
  images: z.array(z.string()).min(3),
  heroImage: z.string().optional(),
});

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeDrop = Easing.bezier(0.18, 0.92, 0.2, 1);

const titles = [
  '速報。日本、終わる',
  '高齢者の手元に忍び寄るワナ',
  '9割が知らないと損する話',
];

const channels = ['仮ニュース通信', '暮らしメモ編集部', 'サンプル動画局'];

const interp = (frame: number, input: number[], output: number[], easing = easeOut) =>
  interpolate(frame, input, output, {...clamp, easing});

const StatusIcons: React.FC = () => (
  <div style={{position: 'absolute', right: 30, top: 22, width: 122, height: 24}}>
    <div style={{position: 'absolute', left: 0, bottom: 2, display: 'flex', gap: 3, alignItems: 'flex-end'}}>
      {[8, 12, 16, 20].map((height, index) => (
        <div
          key={height}
          style={{
            width: 5,
            height,
            borderRadius: 2,
            background: index < 3 ? '#fff' : 'rgba(255,255,255,.55)',
          }}
        />
      ))}
    </div>
    <div
      style={{
        position: 'absolute',
        left: 44,
        top: 2,
        width: 26,
        height: 20,
        borderTop: '5px solid #fff',
        borderRadius: '50% 50% 0 0',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: 8,
          width: 10,
          height: 10,
          borderTop: '4px solid #fff',
          borderRadius: '50% 50% 0 0',
        }}
      />
    </div>
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 3,
        width: 36,
        height: 18,
        border: '2px solid rgba(255,255,255,.82)',
        borderRadius: 5,
      }}
    >
      <div style={{position: 'absolute', right: -6, top: 5, width: 4, height: 8, background: '#fff', borderRadius: 2}} />
      <div style={{position: 'absolute', left: 3, top: 3, width: 8, height: 10, background: '#D32222', borderRadius: 2}} />
    </div>
  </div>
);

const SearchIcon: React.FC = () => (
  <div style={{position: 'relative', width: 28, height: 28}}>
    <div
      style={{
        position: 'absolute',
        left: 3,
        top: 3,
        width: 14,
        height: 14,
        border: '4px solid #fff',
        borderRadius: '50%',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 18,
        top: 19,
        width: 13,
        height: 4,
        borderRadius: 3,
        background: '#fff',
        transform: 'rotate(45deg)',
        transformOrigin: '0 50%',
      }}
    />
  </div>
);

const BellIcon: React.FC = () => (
  <div style={{position: 'relative', width: 30, height: 30}}>
    <div
      style={{
        position: 'absolute',
        left: 7,
        top: 5,
        width: 16,
        height: 18,
        border: '3px solid #fff',
        borderRadius: '12px 12px 7px 7px',
        borderBottom: 'none',
      }}
    />
    <div style={{position: 'absolute', left: 5, top: 22, width: 20, height: 3, background: '#fff', borderRadius: 3}} />
    <div style={{position: 'absolute', left: 12, top: 26, width: 6, height: 4, background: '#fff', borderRadius: 3}} />
  </div>
);

const YouTubeHeader: React.FC = () => (
  <>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 82,
        background: '#080808',
        color: '#fff',
        fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
      }}
    >
      <div style={{position: 'absolute', left: 28, top: 20, fontSize: 22, fontWeight: 800}}>0:08</div>
      <StatusIcons />
    </div>
    <div
      style={{
        position: 'absolute',
        top: 82,
        left: 0,
        right: 0,
        height: 92,
        background: '#090909',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 28,
          top: 24,
          width: 48,
          height: 34,
          borderRadius: 8,
          background: '#f00',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 18,
            top: 8,
            width: 0,
            height: 0,
            borderTop: '9px solid transparent',
            borderBottom: '9px solid transparent',
            borderLeft: '15px solid #fff',
          }}
        />
      </div>
      <div style={{position: 'absolute', left: 92, top: 26, color: '#fff', fontSize: 24, fontWeight: 800}}>
        YouTube
      </div>
      <div style={{position: 'absolute', right: 112, top: 21}}>
        <BellIcon />
      </div>
      <div style={{position: 'absolute', right: 68, top: 22}}>
        <SearchIcon />
      </div>
      <div style={{position: 'absolute', right: 28, top: 24, color: '#fff', fontSize: 30}}>⋮</div>
      {['すべて', 'ニュース', 'ミックス'].map((label, i) => (
        <div
          key={label}
          style={{
            position: 'absolute',
            left: 28 + i * 128,
            bottom: -44,
            height: 40,
            padding: '0 22px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 14,
            background: i === 0 ? '#f1f1f1' : '#252525',
            color: i === 0 ? '#111' : '#fff',
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {label}
        </div>
      ))}
    </div>
  </>
);

const BottomNav: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 86,
      background: 'rgba(9,9,9,0.96)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      color: '#fff',
      fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
    }}
  >
    {[
      ['⌂', 'ホーム'],
      ['▶', 'ショート'],
      ['＋', '作成'],
      ['▣', '登録'],
      ['●', 'マイページ'],
    ].map(([icon, label], i) => (
      <div
        key={label}
        style={{
          position: 'absolute',
          left: 32 + i * 91,
          top: 10,
          width: 60,
          textAlign: 'center',
          opacity: i === 0 ? 1 : 0.78,
        }}
      >
        <div style={{fontSize: i === 2 ? 34 : 26, lineHeight: '30px'}}>{icon}</div>
        <div style={{fontSize: 12, marginTop: 6}}>{label}</div>
      </div>
    ))}
  </div>
);

const FeedCard: React.FC<{
  image: string;
  index: number;
}> = ({image, index}) => (
  <div
    style={{
      width: 472,
      margin: '0 auto 34px',
      color: '#fff',
      fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
    }}
  >
    <div
      style={{
        width: 472,
        height: (472 * 9) / 16,
        borderRadius: 0,
        overflow: 'hidden',
        background: '#111',
        boxShadow: '0 10px 26px rgba(0,0,0,.45)',
      }}
    >
      <Img
        src={staticFile(image)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
    <div style={{display: 'flex', gap: 12, padding: '14px 4px 0'}}>
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: '50%',
          background:
            index === 0
              ? 'linear-gradient(135deg,#ffe600,#f00)'
              : index === 1
                ? 'linear-gradient(135deg,#fff,#d63f3f)'
                : 'linear-gradient(135deg,#f00,#ffe600)',
          flexShrink: 0,
        }}
      />
      <div style={{minWidth: 0, flex: 1}}>
        <div
          style={{
            fontSize: 20,
            lineHeight: 1.25,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {titles[index]}
        </div>
        <div style={{marginTop: 5, color: '#aaa', fontSize: 14, lineHeight: 1.35}}>
          {channels[index]}・{index === 2 ? '98万回視聴' : '137万回視聴'}・{index + 1}年前
        </div>
      </div>
      <div style={{fontSize: 28, lineHeight: '34px', color: '#e8e8e8'}}>⋮</div>
    </div>
  </div>
);

const HesitatingFinger: React.FC<{frame: number}> = ({frame}) => {
  // フィードの2回のスクロールと同期して、指自身も上へスワイプする。
  // 1回目の後だけ指を画面下側に戻し、2回目のスワイプに備える。
  const swipe1 = interp(frame, [0, 44], [0, 1], easeInOut);
  const resetForSecondSwipe = interp(frame, [44, 64], [0, 1], easeInOut);
  const swipe2 = interp(frame, [64, 106], [0, 1], easeInOut);
  const hesitation = interp(frame, [106, 136], [0, 1], easeOut);
  const trembleX = Math.sin(frame * 0.72) * hesitation * 3;
  const trembleY = Math.sin(frame * 0.91) * hesitation * 2;
  const press = interpolate(frame, [174, 181, 188], [0, 1, 0], {...clamp, easing: easeInOut});
  const swipeBottom = 96 + swipe1 * 242 - resetForSecondSwipe * 190 + swipe2 * 190;

  return (
    <Img
      src={staticFile('c02/finger.png')}
      style={{
        position: 'absolute',
        right: -210 + trembleX,
        bottom: swipeBottom + trembleY,
        width: 650,
        height: 366,
        objectFit: 'contain',
        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.62))',
        opacity: 1,
        scale: `${1 - press * 0.025}`,
        transformOrigin: '64% 42%',
        zIndex: 60,
      }}
    />
  );
};

const PlaceholderHeroThumbnail: React.FC = () => (
  <div
    style={{
      position: 'relative',
      width: 1020,
      height: (1020 * 9) / 16,
      overflow: 'hidden',
      background:
        'radial-gradient(circle at 26% 50%, rgba(140,0,10,.9), transparent 35%), linear-gradient(135deg, #050505 0%, #250006 58%, #050505 100%)',
      border: '5px solid #111',
      fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(155deg, transparent 0 42%, rgba(230,0,18,.95) 43%, rgba(230,0,18,.95) 46%, transparent 47%), linear-gradient(190deg, transparent 0 58%, rgba(230,0,18,.55) 59%, transparent 61%)',
        opacity: 0.78,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 42,
        top: 36,
        background: '#E60012',
        color: '#fff',
        fontSize: 48,
        fontWeight: 900,
        padding: '10px 26px 13px',
        transform: 'skewX(-10deg) rotate(-2deg)',
        boxShadow: '0 8px 0 #111',
      }}
    >
      仮
    </div>
    <div
      style={{
        position: 'absolute',
        right: 42,
        top: 42,
        color: '#FFE600',
        fontSize: 38,
        fontWeight: 900,
        textShadow: '0 0 18px rgba(255,230,0,.65)',
      }}
    >
      ※ここに本サムネを差し替え
    </div>
    <div
      style={{
        position: 'absolute',
        left: 210,
        top: 132,
        color: '#fff',
        fontSize: 112,
        fontWeight: 900,
        lineHeight: 0.95,
        letterSpacing: '-0.05em',
        WebkitTextStroke: '9px #111',
        paintOrder: 'stroke fill',
        textShadow: '0 8px 0 rgba(0,0,0,.25), 0 18px 26px rgba(0,0,0,.42)',
      }}
    >
      本動画の
      <br />
      サムネ
    </div>
    <div
      style={{
        position: 'absolute',
        left: 402,
        top: 314,
        color: '#FFE600',
        fontSize: 160,
        fontWeight: 900,
        lineHeight: 0.95,
        letterSpacing: '-0.05em',
        WebkitTextStroke: '11px #111',
        paintOrder: 'stroke fill',
        transform: 'rotate(-3deg)',
        textShadow: '0 9px 0 rgba(0,0,0,.28), 0 18px 26px rgba(0,0,0,.42)',
      }}
    >
      仮配置
    </div>
    <div
      style={{
        position: 'absolute',
        right: 28,
        bottom: 22,
        background: 'rgba(0,0,0,0.82)',
        color: '#fff',
        padding: '8px 14px 9px',
        borderRadius: 7,
        fontSize: 32,
        fontWeight: 800,
        letterSpacing: '0.02em',
      }}
    >
      0:00
    </div>
  </div>
);

const PhoneShell: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      position: 'absolute',
      left: 710,
      top: 54,
      width: 500,
      height: 972,
      borderRadius: 54,
      background: '#030303',
      boxShadow: '0 38px 95px rgba(0,0,0,.74), 0 0 0 3px rgba(255,255,255,.1)',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 14,
        borderRadius: 42,
        overflow: 'hidden',
        background: '#080808',
      }}
    >
      {children}
    </div>
  </div>
);

export const PhoneFeedHesitation: React.FC<z.infer<typeof phoneFeedHesitationSchema>> = ({
  images,
  heroImage,
}) => {
  const frame = useCurrentFrame();
  const scrollY = interpolate(frame, [0, 44, 64, 106, 132], [120, -142, -142, -574, -574], {
    ...clamp,
    easing: easeInOut,
  });
  const stopJolt = interpolate(frame, [126, 132, 138], [0, 1, 0], {...clamp, easing: easeOut});
  const heroStart = 188;
  const dim = interp(frame, [heroStart - 10, heroStart + 14], [0, 1], easeOut);
  const heroDrop = interp(frame, [heroStart, heroStart + 18], [0, 1], easeDrop);
  const heroScale = interpolate(frame, [heroStart, heroStart + 10, heroStart + 24], [1.12, 1.035, 1], {
    ...clamp,
    easing: easeDrop,
  });
  const heroY = interpolate(heroDrop, [0, 1], [-820, 0]);
  const heroOpacity = interp(frame, [heroStart - 2, heroStart + 4], [0, 1], easeOut);

  return (
    <AbsoluteFill
      style={{
        background: 'transparent',
        overflow: 'hidden',
        fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
      }}
    >
      <Sequence from={128} durationInFrames={22} layout="none">
        <Audio src={staticFile('sfx/c02_scroll_stop.wav')} volume={0.65} />
      </Sequence>
      <Sequence from={heroStart} durationInFrames={24} layout="none">
        <Audio src={staticFile('sfx/c01_thump.wav')} volume={0.9} />
      </Sequence>

      <PhoneShell>
        <YouTubeHeader />
        <BottomNav />
        <div
          style={{
            position: 'absolute',
            top: 214,
            left: 0,
            right: 0,
            bottom: 86,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: scrollY + stopJolt * 10,
              left: 0,
              right: 0,
              paddingBottom: 80,
            }}
          >
            {images.slice(0, 3).map((image, index) => (
              <FeedCard key={image} image={image} index={index} />
            ))}
          </div>
          <div
            style={{
              position: 'absolute',
              right: 6,
              top: interp(frame, [0, 132], [34, 390], easeInOut),
              width: 4,
              height: 98,
              borderRadius: 6,
              background: 'rgba(255,255,255,.72)',
              opacity: interp(frame, [0, 20, 150, 174], [0, 0.7, 0.7, 0], easeOut),
            }}
          />
        </div>
        <HesitatingFinger frame={frame} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#000',
            opacity: dim * 0.62,
            zIndex: 70,
          }}
        />
      </PhoneShell>

      <div
        style={{
          position: 'absolute',
          left: 450,
          top: 262 + heroY,
          width: 1020,
          height: (1020 * 9) / 16,
          borderRadius: 24,
          overflow: 'hidden',
          opacity: heroOpacity,
          scale: `${heroScale}`,
          transformOrigin: '50% 50%',
          boxShadow:
            '0 54px 130px rgba(0,0,0,.82), 0 0 0 2px rgba(255,255,255,.18)',
          zIndex: 100,
        }}
      >
        {heroImage ? (
          <Img src={staticFile(heroImage)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        ) : (
          <PlaceholderHeroThumbnail />
        )}
      </div>
    </AbsoluteFill>
  );
};
