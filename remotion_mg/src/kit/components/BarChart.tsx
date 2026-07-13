import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {PaperStage, SourceNotes} from '../stages';
import {theme} from '../theme';

// 紙資料風の横棒グラフ。ラベル=明朝、数字=Oswaldカウントアップ。
export const barChartSchema = z.object({
  title: z.string().optional(),
  bars: z
    .array(
      z.object({
        label: z.string(),
        value: z.number(),
        suffix: z.string().default(''),
      })
    )
    .min(1)
    .max(6),
  accentIndex: z.number().int().optional(), // 朱で強調する行
  source: z.string().optional(),
  conceptual: z.boolean().default(false),
});

export const BarChart: React.FC<z.infer<typeof barChartSchema>> = ({
  title,
  bars,
  accentIndex,
  source,
  conceptual = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const maxValue = Math.max(...bars.map((b) => b.value));
  const maxBarW = 880;
  const rowH = 96;
  const barH = 52;

  return (
    <PaperStage>
      {title ? (
        <div style={{position: 'absolute', left: 120, top: 96}}>
          <div style={{fontSize: 40, fontWeight: 700, letterSpacing: '0.16em'}}>{title}</div>
          <div style={{width: 76, height: 3, background: theme.gold, marginTop: 18}} />
        </div>
      ) : null}

      <div style={{position: 'absolute', left: 120, top: 250}}>
        {bars.map((bar, i) => {
          const delay = 8 + i * 12;
          const grow = spring({
            frame: frame - delay,
            fps,
            config: {damping: 200, stiffness: 60, mass: 0.8},
          });
          const w = (bar.value / maxValue) * maxBarW * grow;
          const shown = Math.round(bar.value * grow);
          const isAccent = i === accentIndex;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: rowH,
                gap: 44,
              }}
            >
              <div
                style={{
                  width: 400,
                  textAlign: 'right',
                  fontSize: 42,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: isAccent ? theme.red : theme.ink,
                }}
              >
                {bar.label}
              </div>
              <div style={{position: 'relative', width: maxBarW, height: barH}}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: w,
                    height: barH,
                    background: isAccent ? theme.red : theme.ink2,
                    borderRadius: 2,
                    boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.25)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: w + 24,
                    top: 0,
                    height: barH,
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: theme.fontNumber,
                    fontSize: 40,
                    color: isAccent ? theme.red : theme.ink,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {shown.toLocaleString('en-US')}
                  {bar.suffix}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SourceNotes source={source} conceptual={conceptual} />
    </PaperStage>
  );
};
