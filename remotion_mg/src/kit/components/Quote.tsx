import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {PaperStage} from '../stages';
import {theme} from '../theme';

// 紙片の上の引用。歴史パートの逸話・発言に使う。
export const quoteSchema = z.object({
  text: z.string(),
  attribution: z.string().optional(), // 例: W・R・ハーストに帰される逸話
  note: z.string().optional(), // 例: 真偽は定かではない
});

export const Quote: React.FC<z.infer<typeof quoteSchema>> = ({text, attribution, note}) => {
  const frame = useCurrentFrame();
  const cardIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const textIn = interpolate(frame, [10, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const attrIn = interpolate(frame, [34, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <PaperStage>
      <div
        style={{
          position: 'absolute',
          left: 260,
          right: 260,
          top: 200,
          bottom: 200,
          backgroundImage: `linear-gradient(rgba(239, 234, 224, 0.9), rgba(239, 234, 224, 0.9)), url(${theme.paperWhite})`,
          backgroundSize: 'cover',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.2)',
          transform: 'rotate(-0.8deg)',
          opacity: cardIn,
          padding: '90px 130px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 54,
            top: 20,
            fontSize: 170,
            color: theme.gold,
            opacity: 0.55,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          「
        </div>
        <div
          style={{
            fontSize: 54,
            lineHeight: 2.0,
            letterSpacing: '0.1em',
            fontWeight: 700,
            opacity: textIn,
          }}
        >
          {text}
        </div>
        <div style={{textAlign: 'right', opacity: attrIn, marginTop: 68}}>
          {attribution ? (
            <div style={{fontSize: 30, color: theme.ink2, letterSpacing: '0.12em'}}>
              — {attribution}
            </div>
          ) : null}
          {note ? (
            <div style={{fontSize: 22, color: theme.ash, marginTop: 14, letterSpacing: '0.08em'}}>
              {note}
            </div>
          ) : null}
        </div>
      </div>
    </PaperStage>
  );
};
