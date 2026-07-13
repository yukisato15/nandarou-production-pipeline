import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {InkStage} from '../stages';
import {theme} from '../theme';

export const titleCardSchema = z.object({
  title: z.string(),
  episode: z.string().optional(), // 例: 『なんだろう』解体 #02
  subtitle: z.string().optional(),
});

export const TitleCard: React.FC<z.infer<typeof titleCardSchema>> = ({
  title,
  episode,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tracking = interpolate(frame, [0, 40], [0.34, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ruleW = interpolate(frame, [8, 36], [0, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // 長いタイトルは自動で縮めて1行に収める(トラッキング込みの実効幅から逆算)
  const fontSize = Math.min(92, Math.floor(1700 / (title.length * 1.22)));

  return (
    <InkStage>
      <div style={{textAlign: 'center', opacity: fade}}>
        <div
          style={{
            fontSize,
            fontWeight: 700,
            letterSpacing: `${tracking}em`,
            marginLeft: `${tracking}em`, // letter-spacingの右余白ぶんを相殺して中央に
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: ruleW,
            height: 2,
            background: theme.gold,
            margin: '38px auto 34px',
          }}
        />
        {subtitle ? (
          <div style={{fontSize: 34, color: theme.white, opacity: 0.85, letterSpacing: '0.18em'}}>
            {subtitle}
          </div>
        ) : null}
        {episode ? (
          <div style={{fontSize: 28, color: theme.ash, letterSpacing: '0.24em', marginTop: 26}}>
            {episode}
          </div>
        ) : null}
      </div>
    </InkStage>
  );
};
