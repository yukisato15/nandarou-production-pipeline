import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';

/**
 * C01 の偽サムネイル・フライスルー。
 *
 * 座標・回転・タイミングは承認済みの C01 フライスルー仕様に固定する。
 * JSON から渡すのは素材ファイルだけにし、演出値をカットごとに変更できない
 * ようにしている（同じ型を再利用しても番組の見た目がぶれないため）。
 */
export const thumbnailStackSchema = z.object({
  images: z.array(z.string()).length(7),
  durationInFrames: z.number().int().positive().optional(),
  /** 透過納品時は none。Studio/QA は roomtone のまま確認する。 */
  bg: z.enum(['roomtone', 'none']).default('roomtone'),
});

type FlySpec = {
  center: [number, number];
  width: number;
  height: number;
  rotate: number;
  startOffset: [number, number];
  startFrame: number;
  landFrame: number;
  glow: number;
};

const FLY_SCALE = 4.2;
const flyEase = Easing.bezier(0.16, 1, 0.3, 1);

// 着地中心、回転、飛来方向、開始/着地フレームは指示書の固定値。
const FLY_SPECS: FlySpec[] = [
  {center: [700, 480], width: 620, height: 349, rotate: -3.5, startOffset: [420, -260], startFrame: 4, landFrame: 16, glow: 0.14},
  {center: [1250, 560], width: 620, height: 349, rotate: 4, startOffset: [-420, 260], startFrame: 24, landFrame: 36, glow: 0.14},
  {center: [960, 627], width: 700, height: 394, rotate: -2, startOffset: [0, -260], startFrame: 44, landFrame: 54, glow: 0.18},
  {center: [330, 795], width: 620, height: 349, rotate: 6, startOffset: [-420, 0], startFrame: 62, landFrame: 70, glow: 0.14},
  {center: [1650, 295], width: 620, height: 349, rotate: -5, startOffset: [420, 0], startFrame: 76, landFrame: 83, glow: 0.14},
  {center: [490, 115], width: 620, height: 349, rotate: 3, startOffset: [0, -260], startFrame: 86, landFrame: 92, glow: 0.14},
  {center: [1490, 935], width: 620, height: 349, rotate: -7, startOffset: [420, 260], startFrame: 93, landFrame: 98, glow: 0.12},
];

const clamp = (frame: number, input: [number, number], output: [number, number], easing?: (v: number) => number) =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

const keyframe = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** A thumbnail image with a fixed 16:9 landing size. */
const ThumbnailCard: React.FC<{
  image: string;
  spec: FlySpec;
  frame: number;
  index: number;
}> = ({image, spec, frame, index}) => {
  const [cx, cy] = spec.center;
  const [ox, oy] = spec.startOffset;
  const opacity = clamp(frame, [spec.startFrame, spec.startFrame + 2], [0, 1], Easing.out(Easing.quad));
  const scale = frame < spec.landFrame
    ? clamp(frame, [spec.startFrame, spec.landFrame], [FLY_SCALE, 1], flyEase)
    : keyframe(frame, [spec.landFrame, spec.landFrame + 1, spec.landFrame + 3], [1, 0.97, 1]);
  const x = clamp(frame, [spec.startFrame, spec.landFrame], [cx + ox, cx], flyEase);
  const y = clamp(frame, [spec.startFrame, spec.landFrame], [cy + oy, cy], flyEase);
  const rotation = clamp(frame, [spec.startFrame, spec.landFrame], [spec.rotate + (index % 2 === 0 ? 3 : -3), spec.rotate], flyEase);
  const blur = clamp(frame, [spec.startFrame, spec.landFrame], [6, 0], flyEase);
  const impact = frame >= spec.landFrame ? keyframe(frame, [spec.landFrame, spec.landFrame + 2, spec.landFrame + 4], [0, 3, 0]) : 0;
  const landGlow = keyframe(frame, [spec.landFrame, spec.landFrame + 1, spec.landFrame + 3], [0, spec.glow, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - spec.width / 2,
        top: y - spec.height / 2 + impact,
        width: spec.width,
        height: spec.height,
        opacity,
        zIndex: index + 1,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: '50% 50%',
        filter: `blur(${blur}px)`,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: `0 26px 72px rgba(0,0,0,.72), 0 0 44px rgba(255,255,255,${landGlow})`,
      }}
    >
      <Img src={staticFile(image)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
    </div>
  );
};

export const FakeThumbnail: React.FC<{image: string; index: number}> = ({image, index}) => (
  <Img src={staticFile(image)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
);

export const ThumbnailStack: React.FC<z.infer<typeof thumbnailStackSchema>> = ({images, bg}) => {
  const frame = useCurrentFrame();
  // 各着地でスタック全体を2Fだけ3px沈める。既着地カードも同じ揺れを受ける。
  const stackSink = FLY_SPECS.reduce((sum, spec) => {
    return sum + keyframe(frame, [spec.landFrame, spec.landFrame + 2, spec.landFrame + 4], [0, 3, 0]);
  }, 0);
  const impactFlash = FLY_SPECS.reduce((sum, spec) => {
    return sum + keyframe(frame, [spec.landFrame, spec.landFrame + 1, spec.landFrame + 3], [0, spec.glow * 0.45, 0]);
  }, 0);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {bg === 'roomtone' ? (
        <>
          {/* 透過納品ではステージ層を描かない。Premiereで共用背景を下に敷く。 */}
          <AbsoluteFill style={{background: '#0A0B0C'}} />
          <AbsoluteFill
            style={{
              background: 'radial-gradient(ellipse at 50% 48%, transparent 34%, rgba(0,0,0,.34) 100%)',
              pointerEvents: 'none',
            }}
          />
          <AbsoluteFill
            style={{
              opacity: 0.09,
              pointerEvents: 'none',
              backgroundImage: 'radial-gradient(rgba(234,230,223,.20) .65px, transparent .85px)',
              backgroundSize: '7px 7px',
              mixBlendMode: 'screen',
            }}
          />
        </>
      ) : null}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${stackSink}px)`}}>
        {images.map((image, index) => (
          <ThumbnailCard key={`${image}-${index}`} image={image} spec={FLY_SPECS[index]} frame={frame} index={index} />
        ))}
      </div>
      <AbsoluteFill
        style={{
          background: '#fff',
          opacity: Math.min(0.22, impactFlash),
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
