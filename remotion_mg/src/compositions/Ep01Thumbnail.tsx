import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import '@fontsource/noto-sans-jp/japanese-900.css';
import '@fontsource/noto-sans-jp/japanese-700.css';

// 第1回の実サムネイル(1280x720静止画)。
// 設計書v4の特例: 第1回のみ煽りサムネ(本編がその手口の解体であり、サムネ自体が伏線)。
// 煽り文法はここが最初で最後。番組パレットは意図的に破る(偽サムネ仕様と同じ色)。
// 文言は本編の★文で裏付けられたものだけを使う(裏付けないコピー禁止)。

export type Ep01ThumbnailProps = {
  variant: 'A' | 'B' | 'C';
};

const YELLOW = '#FFE600';
const RED = '#E60012';
const INK = '#111111';
const GOTHIC = "'Noto Sans JP', 'Hiragino Sans', sans-serif";

// グリーンバック+白余白をコード側でキーイングして抜く(素材は完成品でなくてよい)
const KeyedImg: React.FC<{src: string; style?: React.CSSProperties}> = ({src, style}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [handle] = useState(() => delayRender('chroma-key'));

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      const p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        const r = p[i];
        const g = p[i + 1];
        const b = p[i + 2];
        if (g > 80 && g > r * 1.2 && g > b * 1.2) {
          p[i + 3] = 0; // グリーンバック
        } else if (r > 246 && g > 246 && b > 246) {
          p[i + 3] = 0; // 書き出し余白の純白
        } else if (g > r && g > b) {
          p[i + 1] = Math.max(r, b); // 緑かぶり(スピル)の抑制
        }
      }
      ctx.putImageData(d, 0, 0);
      setUrl(c.toDataURL());
      continueRender(handle);
    };
    img.src = src;
  }, [src, handle]);

  return url ? <img src={url} style={style} /> : null;
};

// 黒フチ+ドロップシャドウの極太文字(煽り文法の基本部品)
const AoriText: React.FC<{
  children: React.ReactNode;
  size: number;
  color: string;
  stroke?: string;
  strokeW?: number;
  style?: React.CSSProperties;
}> = ({children, size, color, stroke = INK, strokeW, style}) => {
  const sw = strokeW ?? Math.max(6, Math.round(size * 0.09));
  return (
    <div
      style={{
        fontFamily: GOTHIC,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.08,
        color,
        WebkitTextStroke: `${sw}px ${stroke}`,
        paintOrder: 'stroke fill',
        textShadow: '0 6px 18px rgba(0,0,0,0.45)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ===== A案: あなた、売られてます(驚愕顔) =====
const VariantA: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 40%, #3A0A0A 0%, #16090B 55%, #0A0507 100%)'}}>
    {/* 下落する赤ライン */}
    <svg viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
      <polyline
        points="20,300 260,340 420,320 640,430 840,410 1260,640"
        stroke={RED}
        strokeWidth={14}
        fill="none"
        style={{filter: `drop-shadow(0 0 18px ${RED})`}}
      />
    </svg>
    {/* 驚愕顔(右側・キー抜き+赤環境光) */}
    <KeyedImg
      src={staticFile('c01/C01_thumb_01.png')}
      style={{
        position: 'absolute',
        right: -290,
        bottom: -40,
        height: 780,
        filter: 'contrast(1.08) saturate(1.15) drop-shadow(0 0 40px rgba(230,0,18,0.35))',
      }}
    />
    {/* 緊急バッジ */}
    <div
      style={{
        position: 'absolute',
        left: -12,
        top: 26,
        background: RED,
        color: '#fff',
        fontFamily: GOTHIC,
        fontWeight: 900,
        fontSize: 44,
        padding: '10px 44px 10px 34px',
        transform: 'rotate(-2deg)',
        clipPath: 'polygon(0 0, 100% 0, 94% 100%, 0 100%)',
        letterSpacing: '0.06em',
      }}
    >
      気づいてない人へ
    </div>
    {/* メインコピー */}
    <div style={{position: 'absolute', left: 44, top: 190, transform: 'rotate(-2deg)'}}>
      <AoriText size={110} color="#fff">
        あなた、
      </AoriText>
      <AoriText size={182} color={YELLOW} style={{marginTop: 6}}>
        売られてます
      </AoriText>
    </div>
    {/* サブ */}
    <div
      style={{
        position: 'absolute',
        left: 52,
        bottom: 54,
        fontFamily: GOTHIC,
        fontWeight: 700,
        fontSize: 40,
        color: '#fff',
        textShadow: `0 0 14px ${RED}, 0 0 4px ${RED}`,
      }}
    >
      ※しかも、毎日
    </div>
  </AbsoluteFill>
);

// ===== B案: 友達は、金で買えます(指差し) =====
const VariantB: React.FC = () => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${YELLOW} 0%, #FFD800 100%)`}}>
    {/* 集中線 */}
    <svg viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, opacity: 0.16}}>
      {Array.from({length: 36}).map((_, i) => {
        const a = (i / 36) * Math.PI * 2;
        const x = 640 + Math.cos(a) * 1400;
        const y = 360 + Math.sin(a) * 1400;
        return <polygon key={i} points={`640,360 ${x - 26},${y} ${x + 26},${y}`} fill={INK} />;
      })}
    </svg>
    {/* 指差し男(右) */}
    <KeyedImg
      src={staticFile('c01/C01_thumb_03.png')}
      style={{
        position: 'absolute',
        right: -300,
        bottom: -60,
        height: 800,
        filter: 'contrast(1.06) saturate(1.05)',
      }}
    />
    {/* 赤丸バッジ */}
    <div
      style={{
        position: 'absolute',
        left: 30,
        top: 22,
        width: 218,
        height: 218,
        borderRadius: '50%',
        background: RED,
        border: '10px solid #fff',
        transform: 'rotate(-12deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: GOTHIC,
        fontWeight: 900,
        fontSize: 52,
        color: '#fff',
        lineHeight: 1.15,
      }}
    >
      実話
      <br />
      です
    </div>
    {/* メインコピー */}
    <div style={{position: 'absolute', left: 48, top: 268, transform: 'rotate(-1.5deg)'}}>
      <AoriText size={104} color={INK} stroke="#fff">
        友達は、
      </AoriText>
      <AoriText size={168} color={RED} stroke="#fff" style={{marginTop: 4}}>
        金で買えます
      </AoriText>
    </div>
    {/* サブ */}
    <div
      style={{
        position: 'absolute',
        left: 54,
        bottom: 44,
        fontFamily: GOTHIC,
        fontWeight: 900,
        fontSize: 42,
        color: INK,
        background: '#fff',
        padding: '6px 22px',
        transform: 'skewX(-8deg)',
      }}
    >
      1時間 ¥○,○○○——値段も出します
    </div>
  </AbsoluteFill>
);

// ===== C案: メタ煽り(煽りサムネを赤ペンで解体) =====
const VariantC: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 40%, #3A0A0A 0%, #16090B 55%, #0A0507 100%)'}}>
    <svg viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
      <polyline
        points="20,300 260,340 420,320 640,430 840,410 1260,640"
        stroke={RED}
        strokeWidth={14}
        fill="none"
        style={{filter: `drop-shadow(0 0 18px ${RED})`}}
      />
    </svg>
    <KeyedImg
      src={staticFile('c01/C01_thumb_01.png')}
      style={{
        position: 'absolute',
        right: -290,
        bottom: -40,
        height: 780,
        filter: 'contrast(1.08) saturate(1.15) drop-shadow(0 0 40px rgba(230,0,18,0.35))',
      }}
    />
    <div style={{position: 'absolute', left: 44, top: 130, transform: 'rotate(-2deg)'}}>
      <AoriText size={100} color="#fff">
        あなた、
      </AoriText>
      <AoriText size={164} color={YELLOW} style={{marginTop: 6}}>
        売られてます
      </AoriText>
    </div>
    {/* 赤ペンの添削(番組の正体) */}
    <svg viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
      <ellipse
        cx={430}
        cy={280}
        rx={400}
        ry={190}
        fill="none"
        stroke="#FF3B2F"
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray="640 40 380 28 900"
        transform="rotate(-4 430 280)"
      />
      <path
        d="M 700 470 C 760 520, 820 540, 880 545"
        stroke="#FF3B2F"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
    <div
      style={{
        position: 'absolute',
        left: 560,
        bottom: 84,
        fontFamily: GOTHIC,
        fontWeight: 900,
        fontSize: 58,
        color: '#fff',
        background: 'rgba(180,20,14,0.92)',
        padding: '10px 26px',
        transform: 'rotate(-2deg)',
        border: '4px solid #fff',
      }}
    >
      この手口、解体します
    </div>
  </AbsoluteFill>
);

export const Ep01Thumbnail: React.FC<Ep01ThumbnailProps> = ({variant}) => {
  if (variant === 'B') return <VariantB />;
  if (variant === 'C') return <VariantC />;
  return <VariantA />;
};
