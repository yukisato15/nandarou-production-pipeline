import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';

export const thumbnailStackSchema = z.object({
  images: z.array(z.string()).min(3),
  beatFrames: z.array(z.number().int().min(0)).default([8, 48, 88]),
  caption: z.string().optional(),
});

type CardLayout = {
  left: number;
  top: number;
  width: number;
  rotate: number;
  z: number;
};

const stackLayout: CardLayout[] = [
  {left: 170, top: 105, width: 1020, rotate: -6.5, z: 1},
  {left: 455, top: 250, width: 1020, rotate: 3.2, z: 2},
  {left: 755, top: 385, width: 1020, rotate: -2.4, z: 3},
];

const fit = {
  width: '100%',
  height: '100%',
  objectFit: 'contain' as const,
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const interp = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing?: (input: number) => number
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

const StrokeText: React.FC<{
  children: React.ReactNode;
  color: string;
  stroke?: string;
  size: number;
  weight?: number;
  style?: React.CSSProperties;
}> = ({children, color, stroke = '#111', size, weight = 900, style}) => (
  <div
    style={{
      color,
      fontSize: size,
      fontWeight: weight,
      lineHeight: 0.95,
      letterSpacing: '-0.05em',
      WebkitTextStroke: `${Math.max(4, Math.round(size * 0.075))}px ${stroke}`,
      textShadow: '0 8px 0 rgba(0,0,0,0.25), 0 18px 26px rgba(0,0,0,0.42)',
      paintOrder: 'stroke fill',
      whiteSpace: 'pre-line',
      ...style,
    }}
  >
    {children}
  </div>
);

const DurationBadge: React.FC<{text: string}> = ({text}) => (
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
    {text}
  </div>
);

const RedArrow: React.FC<{left: number; top: number; rotate: number; scale?: number}> = ({
  left,
  top,
  rotate,
  scale = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width: 230 * scale,
      height: 34 * scale,
      background: '#E60012',
      transform: `rotate(${rotate}deg)`,
      boxShadow: '0 0 24px rgba(230,0,18,0.5)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        right: -48 * scale,
        top: -33 * scale,
        width: 0,
        height: 0,
        borderTop: `${50 * scale}px solid transparent`,
        borderBottom: `${50 * scale}px solid transparent`,
        borderLeft: `${78 * scale}px solid #E60012`,
      }}
    />
  </div>
);

const Thumbnail01: React.FC<{image: string}> = ({image}) => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(circle at 25% 50%, rgba(140,0,10,0.78), transparent 34%), linear-gradient(135deg, #070707 0%, #200006 55%, #070707 100%)',
      overflow: 'hidden',
      border: '5px solid #111',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(155deg, transparent 0 42%, rgba(230,0,18,.95) 43%, rgba(230,0,18,.95) 46%, transparent 47%), linear-gradient(190deg, transparent 0 58%, rgba(230,0,18,.55) 59%, transparent 61%)',
        opacity: 0.7,
      }}
    />
    <Img
      src={staticFile(image)}
      style={{
        position: 'absolute',
        // 人物を大きくし、元画像の下端がサムネ内に見えないように外へ逃がす。
        left: -390,
        bottom: -420,
        width: 1600,
        height: 1400,
        objectFit: 'contain',
        filter: 'drop-shadow(0 16px 22px rgba(0,0,0,.75)) saturate(1.25) contrast(1.1)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 38,
        top: 34,
        background: '#E60012',
        color: '#fff',
        fontSize: 48,
        fontWeight: 900,
        padding: '10px 26px 13px',
        transform: 'skewX(-10deg) rotate(-2deg)',
        boxShadow: '0 8px 0 #111',
      }}
    >
      緊急
    </div>
    <StrokeText color="#fff" size={122} style={{position: 'absolute', left: 500, top: 112}}>
      日本、
    </StrokeText>
    <StrokeText color="#FFE600" size={170} style={{position: 'absolute', left: 458, top: 292}}>
      終わる
    </StrokeText>
    <div
      style={{
        position: 'absolute',
        right: 42,
        top: 38,
        color: '#FFE600',
        fontSize: 38,
        fontWeight: 900,
        textShadow: '0 0 18px rgba(255,230,0,.65)',
      }}
    >
      ※もう間に合いません
    </div>
    <DurationBadge text="10:24" />
  </AbsoluteFill>
);

const Thumbnail02: React.FC<{image: string}> = ({image}) => (
  <AbsoluteFill
    style={{
      background: 'linear-gradient(180deg, #fff 0%, #fff9d7 100%)',
      overflow: 'hidden',
      border: '5px solid #111',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        height: 92,
        background: '#FFE600',
        borderBottom: '8px solid #111',
        color: '#111',
        fontSize: 48,
        fontWeight: 900,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 40,
      }}
    >
      知らないと危険
    </div>
    <Img
      src={staticFile(image)}
      style={{
        position: 'absolute',
        // 手元と年金手帳を約25%拡大。素材の下端はフレーム外へ。
        right: -340,
        bottom: -372,
        width: 1520,
        height: 1350,
        objectFit: 'contain',
        filter: 'drop-shadow(0 14px 18px rgba(0,0,0,.42)) contrast(1.06)',
      }}
    />
    <StrokeText color="#111" stroke="#fff" size={128} style={{position: 'absolute', left: 58, top: 155}}>
      年金、
    </StrokeText>
    <div
      style={{
        position: 'absolute',
        left: 48,
        top: 337,
        width: 590,
        height: 118,
        background: '#FFE600',
        transform: 'skewX(-9deg) rotate(-2deg)',
      }}
    />
    <StrokeText color="#E60012" stroke="#fff" size={160} style={{position: 'absolute', left: 52, top: 295}}>
      消える
    </StrokeText>
    <StrokeText color="#111" stroke="#fff" size={102} style={{position: 'absolute', left: 660, top: 140}}>
      ¥0
    </StrokeText>
    <div
      style={{
        position: 'absolute',
        left: 620,
        top: 104,
        width: 250,
        height: 150,
        border: '12px solid #E60012',
        borderRadius: '50%',
        transform: 'rotate(-9deg)',
      }}
    />
    <DurationBadge text="8:31" />
  </AbsoluteFill>
);

const Thumbnail03: React.FC<{image: string}> = ({image}) => (
  <AbsoluteFill
    style={{
      background: '#FFE600',
      overflow: 'hidden',
      border: '5px solid #111',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: -240,
        background:
          'repeating-conic-gradient(from 0deg at 38% 52%, rgba(0,0,0,.16) 0deg 5deg, transparent 5deg 12deg)',
        opacity: 0.44,
      }}
    />
    <Img
      src={staticFile(image)}
      style={{
        position: 'absolute',
        // 人物を約25%拡大。胴体の切れ目はサムネの下外に隠す。
        right: -390,
        bottom: -400,
        width: 1520,
        height: 1400,
        objectFit: 'contain',
        filter: 'drop-shadow(0 16px 18px rgba(0,0,0,.46)) contrast(1.08) saturate(1.15)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 44,
        top: 40,
        width: 210,
        height: 210,
        borderRadius: '50%',
        background: '#E60012',
        border: '8px solid #fff',
        transform: 'rotate(-12deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff',
        fontSize: 42,
        fontWeight: 900,
        lineHeight: 1.05,
        boxShadow: '0 12px 0 rgba(0,0,0,.28)',
      }}
    >
      9割が
      <br />
      知らない
    </div>
    <StrokeText color="#111" stroke="#fff" size={104} style={{position: 'absolute', left: 68, top: 280}}>
      知らないと
    </StrokeText>
    <StrokeText color="#E60012" stroke="#fff" size={168} style={{position: 'absolute', left: 54, top: 410}}>
      損する
    </StrokeText>
    <DurationBadge text="12:08" />
  </AbsoluteFill>
);

export const FakeThumbnail: React.FC<{image: string; index: number}> = ({image, index}) => {
  if (index === 0) return <Thumbnail01 image={image} />;
  if (index === 1) return <Thumbnail02 image={image} />;
  return <Thumbnail03 image={image} />;
};

export const ThumbnailStack: React.FC<z.infer<typeof thumbnailStackSchema>> = ({
  images,
  beatFrames = [8, 48, 88],
  caption,
}) => {
  const frame = useCurrentFrame();
  const finalPush = interp(frame, [128, 226], [1, 1.04], easeOut);
  const captionOpacity = interp(frame, [110, 132], [0, 0.82], easeOut);

  return (
    <AbsoluteFill
      style={{
        // Premiere等で映像へ重ねられるよう、カード外側は完全透過にする。
        // 各サムネ内部の背景色はFakeThumbnail側で維持する。
        background: 'transparent',
        overflow: 'hidden',
        fontFamily:
          "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Noto Sans JP', 'Arial Black', sans-serif",
      }}
    >
      {beatFrames.slice(0, 3).map((beat, index) => (
        <Sequence key={`c01-thump-${index}`} from={beat} durationInFrames={18} layout="none">
          <Audio src={staticFile('sfx/c01_thump.wav')} volume={index === 2 ? 0.95 : 0.82} />
        </Sequence>
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${finalPush})`,
          transformOrigin: '50% 52%',
        }}
      >
        {images.slice(0, 3).map((image, index) => {
          const beat = beatFrames[index] ?? index * 40;
          const spec = stackLayout[index];
          const enter = interp(frame, [beat, beat + 13], [0, 1], Easing.bezier(0.2, 0.95, 0.2, 1));
          const settle = interp(frame, [beat + 7, beat + 24], [1, 0], easeOut);
          const flash = interpolate(frame, [beat, beat + 4, beat + 16], [0, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const y = interpolate(frame, [beat, beat + 9, beat + 17], [-690, 34, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.12, 0.9, 0.16, 1),
          });
          const punchScale = interpolate(frame, [beat, beat + 6, beat + 18], [1.05, 1.05, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: easeOut,
          });
          const scale = punchScale * (1 + settle * 0.025);
          const impactShake = interpolate(frame, [beat + 9, beat + 11, beat + 14, beat + 18], [0, -10, 6, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <React.Fragment key={image}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: index === 0 ? '#E60012' : index === 1 ? '#fff' : '#FFE600',
                  opacity: flash * 0.17,
                  mixBlendMode: 'screen',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: spec.left,
                  top: spec.top + y + impactShake,
                  width: spec.width,
                  aspectRatio: '16 / 9',
                  borderRadius: 20,
                  overflow: 'hidden',
                  opacity: enter,
                  zIndex: spec.z,
                  transform: `rotate(${spec.rotate}deg) scale(${scale})`,
                  transformOrigin: '50% 50%',
                  boxShadow:
                    '0 40px 95px rgba(0,0,0,0.78), 0 0 0 2px rgba(255,255,255,0.12)',
                }}
              >
                <FakeThumbnail image={image} index={index} />
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {caption ? (
        <div
          style={{
            position: 'absolute',
            left: 74,
            bottom: 54,
            color: '#EAE6DF',
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '0.06em',
            opacity: captionOpacity,
            textShadow: '0 4px 18px rgba(0,0,0,.9)',
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
