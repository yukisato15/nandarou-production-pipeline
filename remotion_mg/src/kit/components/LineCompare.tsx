import React from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';
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

  // 1. グリッドの引き込みアニメーション (0F - 15F)
  const gridProgress = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // 各系列のアニメーション設定
  // si=0 (本当) -> 15Fから75Fまで、穏やかなイージング
  // si=1 (ウソ) -> 25Fから85Fまで、急激なイージング (追い抜く)
  // si=2 (その他) -> 35Fから95Fまで
  const getLineProgress = (si: number) => {
    const start = 15 + si * 10;
    const end = start + 60;
    const easing = si === 1 
      ? Easing.bezier(0.65, 0, 0.15, 1) // 急加速して追い抜くベジェ
      : Easing.out(Easing.quad);
    
    return interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing,
    });
  };

  // 系列ごとの先端座標と現在値の計算
  const lineDetails = series.map((s, si) => {
    const progress = getLineProgress(si);
    const idxFloat = progress * (s.values.length - 1);
    const idx = Math.floor(idxFloat);
    const t = idxFloat - idx;
    
    let currentVal = s.values[0];
    if (idx < s.values.length - 1) {
      currentVal = s.values[idx] + t * (s.values[idx + 1] - s.values[idx]);
    } else {
      currentVal = s.values[s.values.length - 1];
    }

    return {
      progress,
      curX: toX(idxFloat),
      curY: toY(currentVal),
      currentVal,
    };
  });

  // 交点（追い抜き地点）の計算 (主に si=0 と si=1 の交差を検知)
  let intersection: {x: number; y: number; s1ProgressThreshold: number} | null = null;
  if (series.length >= 2) {
    const s0 = series[0];
    const s1 = series[1];
    const len = Math.min(s0.values.length, s1.values.length);
    for (let i = 0; i < len - 1; i++) {
      const v0s = s0.values[i];
      const v0e = s0.values[i + 1];
      const v1s = s1.values[i];
      const v1e = s1.values[i + 1];
      
      // 交差の検知
      if ((v0s - v1s) * (v0e - v1e) < 0) {
        const t = (v0s - v1s) / ((v1e - v1s) - (v0e - v0s));
        const val = v0s + t * (v0e - v0s);
        const idxFloat = i + t;
        intersection = {
          x: toX(idxFloat),
          y: toY(val),
          s1ProgressThreshold: idxFloat / (len - 1),
        };
        break;
      }
    }
  }

  // 交点インジケーターの表示判定
  // s1 (ウソ) の progress が交点閾値を超えたら表示
  const s1Progress = lineDetails[1]?.progress ?? 0;
  const showIntersection = intersection && s1Progress >= intersection.s1ProgressThreshold;
  const intersectionScale = showIntersection 
    ? interpolate(s1Progress, [intersection!.s1ProgressThreshold, intersection!.s1ProgressThreshold + 0.15], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.back(1.5)),
      })
    : 0;

  // パルスアニメーション (常にループする波形効果)
  const pulseScale = showIntersection 
    ? 1 + 0.25 * Math.sin((frame * 0.15) % (Math.PI * 2))
    : 1;

  return (
    <PaperStage>
      {title ? (
        <div style={{position: 'absolute', left: 120, top: 96}}>
          <div
            style={{
              fontFamily: theme.fontMincho,
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: theme.ink,
            }}
          >
            {title}
          </div>
          <div style={{width: 110, height: 4, background: theme.gold, marginTop: 22}} />
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

        {/* グリッド線の描画 (左から右へ引かれるアニメーション) */}
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={AREA.left}
            x2={AREA.left + AREA.width * gridProgress}
            y1={AREA.top + AREA.height * t}
            y2={AREA.top + AREA.height * t}
            stroke="rgba(14,15,16,0.25)"
            strokeWidth={t === 1 ? 3 : 1}
          />
        ))}

        {/* 折れ線の描画 */}
        {series.map((s, si) => {
          const detail = lineDetails[si];
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
              strokeDashoffset={1 - detail.progress}
            />
          );
        })}

        {/* 交点インジケーター (VOX風二重丸パルス) */}
        {intersection && showIntersection && (
          <g transform={`translate(${intersection.x}, ${intersection.y}) scale(${intersectionScale})`}>
            {/* パルス用外円 */}
            <circle
              cx={0}
              cy={0}
              r={18 * pulseScale}
              fill="none"
              stroke={theme.red}
              strokeWidth={2}
              opacity={interpolate(pulseScale, [1, 1.25], [0.8, 0], {extrapolateRight: 'clamp'})}
            />
            {/* 実線内円 */}
            <circle
              cx={0}
              cy={0}
              r={8}
              fill={theme.red}
            />
            <circle
              cx={0}
              cy={0}
              r={12}
              fill="none"
              stroke={theme.red}
              strokeWidth={2}
            />
          </g>
        )}
      </svg>

      {/* 線先端のドットと数値・系列名のカプセル型吹き出し */}
      {series.map((s, si) => {
        const detail = lineDetails[si];
        const color = seriesColor(s.color ?? 'ink');
        
        // 線の描画が開始されたらドットと数値をフェードイン
        const start = 15 + si * 10;
        const opacity = interpolate(frame, [start, start + 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={si}
            style={{
              position: 'absolute',
              left: detail.curX,
              top: detail.curY,
              transform: 'translate(-50%, -50%)',
              opacity,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* 先端ドット */}
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: color,
                border: `3px solid ${theme.paper}`,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            />
            
            {/* カプセル型数値・系列ラベル表示 (ドットの横) */}
            <div
              style={{
                position: 'absolute',
                left: 22,
                backgroundColor: color,
                color: theme.paper,
                fontSize: 32,
                fontWeight: 900,
                padding: '8px 22px',
                borderRadius: 9999, // カプセル型
                whiteSpace: 'nowrap',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                transform: 'translateY(-1px)',
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
              }}
            >
              <span style={{
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: '0.08em',
                fontFamily: theme.fontMincho, // しっぽり明朝で手ざわり感
              }}>{s.label}</span>
              <span style={{
                fontFamily: theme.fontNumber,
                fontSize: 34,
                fontWeight: 800,
              }}>{Math.round(detail.currentVal)}</span>
            </div>
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

