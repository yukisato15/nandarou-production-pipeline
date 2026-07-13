import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {InkStage} from '../stages';
import {theme} from '../theme';

// M6 ★宣言。テロップ規定: 1文字2Fずらし、強調語のみ金茶1.15倍。
export const statementSchema = z.object({
  text: z.string(),
  emphasis: z.string().optional(),
  startAt: z.number().int().min(0).default(10),
});

export const Statement: React.FC<z.infer<typeof statementSchema>> = ({
  text,
  emphasis,
  startAt = 10,
}) => {
  const frame = useCurrentFrame();
  const emphStart = emphasis ? text.indexOf(emphasis) : -1;
  const emphEnd = emphStart >= 0 && emphasis ? emphStart + emphasis.length : -1;

  return (
    <InkStage>
      <div
        style={{
          fontSize: 64,
          letterSpacing: '0.12em',
          lineHeight: 1.9,
          maxWidth: 1560,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[...text].map((ch, i) => {
          const opacity = interpolate(frame, [startAt + i * 2, startAt + i * 2 + 8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const isEmph = i >= emphStart && i < emphEnd;
          return (
            <span
              key={i}
              style={{
                opacity,
                color: isEmph ? theme.gold : theme.white,
                fontSize: isEmph ? '1.15em' : undefined,
                fontWeight: isEmph ? 700 : 400,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </InkStage>
  );
};
