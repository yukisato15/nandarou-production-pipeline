import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {PaperStage, SourceNotes} from '../stages';
import {theme} from '../theme';

// 論文・研究の要点カード。大きな数字/固有名を順に提示する(例: MIT / 2018 / 126,000)。
export const statCardSchema = z.object({
  title: z.string().optional(),
  items: z
    .array(
      z.object({
        value: z.string(), // 「126,000」「MIT」など。文字列なので単位も書ける
        label: z.string(), // 下に添える説明
      })
    )
    .min(1)
    .max(4),
  source: z.string().optional(),
  conceptual: z.boolean().default(false),
});

export const StatCard: React.FC<z.infer<typeof statCardSchema>> = ({
  title,
  items,
  source,
  conceptual = false,
}) => {
  const frame = useCurrentFrame();

  return (
    <PaperStage>
      {title ? (
        <div style={{position: 'absolute', left: 120, top: 96}}>
          <div style={{fontSize: 40, fontWeight: 700, letterSpacing: '0.16em'}}>{title}</div>
          <div style={{width: 76, height: 3, background: theme.gold, marginTop: 18}} />
        </div>
      ) : null}

      <div
        style={{
          position: 'absolute',
          left: 120,
          right: 120,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 110,
        }}
      >
        {items.map((item, i) => {
          const start = 12 + i * 22;
          const inOp = interpolate(frame, [start, start + 14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const rise = interpolate(frame, [start, start + 14], [24, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                textAlign: 'center',
                opacity: inOp,
                transform: `translateY(${rise}px)`,
                maxWidth: 480,
              }}
            >
              <div
                style={{
                  fontFamily: theme.fontNumber,
                  fontSize: 128,
                  lineHeight: 1.1,
                  color: theme.ink,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.value}
              </div>
              <div style={{width: 56, height: 3, background: theme.gold, margin: '26px auto'}} />
              <div
                style={{
                  fontSize: 30,
                  color: theme.ink2,
                  letterSpacing: '0.1em',
                  lineHeight: 1.7,
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      <SourceNotes source={source} conceptual={conceptual} />
    </PaperStage>
  );
};
