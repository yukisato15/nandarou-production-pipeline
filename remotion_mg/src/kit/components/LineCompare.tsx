import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {PaperStage, SourceNotes} from '../stages';
import {seriesColor, theme} from '../theme';

// 折れ線の比較(最大3系列)。「ウソが本当を追い抜く」型の画。
export const lineCompareSchema = z.object({
  title: z.string().optional(),
  series: z
    .array(
      z.object({
        label: z.string(),
        values: z.array(z.number()).min(2),
        color: z.enum(['ink', 'red', 'gold']).default('ink'),
      })
    )
    .min(1)
    .max(3),
  xLabels: z.array(z.string()).optional(),
  source: z.string().optional(),
  conceptual: z.boolean().default(false),
});

const AREA = {left: 180, top: 260, width: 1460, height: 560};

export const LineCompare: React.FC<z.infer<typeof lineCompareSchema>> = ({
  title,
  series,
  xLabels,
  source,
  conceptual = false,
}) => {
  const frame = useCurrentFrame();
  const allValues = series.flatMap((s) => s.values);
  const maxV = Math.max(...allValues);
  const minV = Math.min(0, ...allValues);
  const n = Math.max(...series.map((s) => s.values.length));

  const toX = (i: number) => AREA.left + (i / (n - 1)) * AREA.width;
  const toY = (v: number) => AREA.top + AREA.height - ((v - minV) / (maxV - minV)) * AREA.height;

  return (
    <PaperStage>
      {title ? (
        <div style={{position: 'absolute', left: 120, top: 96}}>
          <div style={{fontSize: 40, fontWeight: 700, letterSpacing: '0.16em'}}>{title}</div>
          <div style={{width: 76, height: 3, background: theme.gold, marginTop: 18}} />
        </div>
      ) : null}

      <svg
        style={{position: 'absolute', inset: 0}}
        viewBox="0 0 1920 1080"
        fill="none"
      >
        <defs>
          <filter id="kit-rough" x="-5%" y="-20%" width="110%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
          </filter>
        </defs>
        {/* 薄い墨のグリッド */}
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={AREA.left}
            x2={AREA.left + AREA.width}
            y1={AREA.top + AREA.height * t}
            y2={AREA.top + AREA.height * t}
            stroke="rgba(14,15,16,0.25)"
            strokeWidth={t === 1 ? 3 : 1}
          />
        ))}
        {series.map((s, si) => {
          const start = 10 + si * 8;
          const progress = interpolate(frame, [start, start + 52], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const pts = s.values
            .map((v, i) => `${toX(i)},${toY(v)}`)
            .join(' ');
          return (
            <polyline
              key={si}
              points={pts}
              stroke={seriesColor(s.color ?? 'ink')}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#kit-rough)"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - progress}
            />
          );
        })}
      </svg>

      {/* 系列ラベル(線の終点に出す) */}
      {series.map((s, si) => {
        const start = 10 + si * 8;
        const labelIn = interpolate(frame, [start + 48, start + 62], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const lastV = s.values[s.values.length - 1];
        return (
          <div
            key={si}
            style={{
              position: 'absolute',
              left: AREA.left + AREA.width + 24,
              top: toY(lastV) - 26,
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: seriesColor(s.color ?? 'ink'),
              opacity: labelIn,
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </div>
        );
      })}

      {/* X軸ラベル */}
      {xLabels ? (
        <div
          style={{
            position: 'absolute',
            left: AREA.left,
            top: AREA.top + AREA.height + 28,
            width: AREA.width,
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: theme.fontNumber,
            fontSize: 26,
            color: theme.ash,
          }}
        >
          {xLabels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      ) : null}

      <SourceNotes source={source} conceptual={conceptual} />
    </PaperStage>
  );
};
