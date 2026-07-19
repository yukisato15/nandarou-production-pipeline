import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {PaperStage, SourceNotes} from '../stages';
import {theme} from '../theme';

export const rmtIconSwapSchema = z.object({
  telopText: z.string().default('広めていたのは、《人間》です。'),
  source: z.string().optional(),
  conceptual: z.boolean().default(false),
});

type Props = z.infer<typeof rmtIconSwapSchema>;

// ロボットアイコン (手ざわり感のあるミニマルなロボット)
const RobotIcon: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <svg
    viewBox="0 0 100 100"
    width="160"
    height="160"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    {/* アンテナ */}
    <line x1="50" y1="28" x2="50" y2="12" />
    <circle cx="50" cy="12" r="3" fill="currentColor" />
    {/* 頭部 */}
    <rect x="22" y="28" width="56" height="48" rx="6" />
    {/* 目 */}
    <circle cx="38" cy="48" r="4.5" fill="currentColor" />
    <circle cx="62" cy="48" r="4.5" fill="currentColor" />
    {/* 口 */}
    <line x1="38" y1="62" x2="62" y2="62" />
    {/* 耳/ネジ */}
    <rect x="16" y="46" width="6" height="12" rx="1.5" />
    <rect x="78" y="46" width="6" height="12" rx="1.5" />
  </svg>
);

// 人間シルエットアイコン
const HumanIcon: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <svg
    viewBox="0 0 100 100"
    width="64"
    height="64"
    fill="currentColor"
    style={style}
  >
    {/* 頭 */}
    <circle cx="50" cy="28" r="18" />
    {/* 体/肩 */}
    <path d="M16 84 C16 62, 30 50, 50 50 C70 50, 84 62, 84 84 Z" />
  </svg>
);

// 手書き風バツ(X)マーク
const CrossMark: React.FC<{
  progress1: number;
  progress2: number;
  style?: React.CSSProperties;
}> = ({progress1, progress2, style}) => {
  const lineLength = 100;
  return (
    <svg
      viewBox="0 0 100 100"
      width="240"
      height="240"
      stroke={theme.red}
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
      style={style}
    >
      <path
        d="M20 20 L80 80"
        strokeDasharray={lineLength}
        strokeDashoffset={lineLength * (1 - progress1)}
      />
      <path
        d="M80 20 L20 80"
        strokeDasharray={lineLength}
        strokeDashoffset={lineLength * (1 - progress2)}
      />
    </svg>
  );
};

export const RmtIconSwap: React.FC<Props> = ({
  telopText,
  source,
  conceptual = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 1. ロボット登場＆待機
  const robotOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 2. 朱色バツ印アニメーション (24F - 48F)
  const crossProgress1 = interpolate(frame, [24, 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const crossProgress2 = interpolate(frame, [36, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 3. ロボット＋バツ印退場 (48F - 72F)
  // 下方へスライド＋フェードアウト
  const exitProgress = interpolate(frame, [48, 64], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitTranslateY = exitProgress * 150;
  const exitOpacity = 1 - exitProgress;

  // 4. 人間ノードの定義
  // 画面中心 (960, 440) を中心とした同心円配置
  const centerX = 960;
  const centerY = 440;
  const humanNodes = [
    // 第一層 (R=180) - 4人
    { x: centerX + 180 * Math.cos(0), y: centerY + 180 * Math.sin(0), delay: 80 },
    { x: centerX + 180 * Math.cos(Math.PI * 0.5), y: centerY + 180 * Math.sin(Math.PI * 0.5), delay: 84 },
    { x: centerX + 180 * Math.cos(Math.PI), y: centerY + 180 * Math.sin(Math.PI), delay: 88 },
    { x: centerX + 180 * Math.cos(Math.PI * 1.5), y: centerY + 180 * Math.sin(Math.PI * 1.5), delay: 92 },
    // 第二層 (R=340) - 6人
    { x: centerX + 340 * Math.cos(Math.PI * 0.15), y: centerY + 340 * Math.sin(Math.PI * 0.15), delay: 96 },
    { x: centerX + 340 * Math.cos(Math.PI * 0.45), y: centerY + 340 * Math.sin(Math.PI * 0.45), delay: 100 },
    { x: centerX + 340 * Math.cos(Math.PI * 0.8), y: centerY + 340 * Math.sin(Math.PI * 0.8), delay: 104 },
    { x: centerX + 340 * Math.cos(Math.PI * 1.15), y: centerY + 340 * Math.sin(Math.PI * 1.15), delay: 108 },
    { x: centerX + 340 * Math.cos(Math.PI * 1.5), y: centerY + 340 * Math.sin(Math.PI * 1.5), delay: 112 },
    { x: centerX + 340 * Math.cos(Math.PI * 1.85), y: centerY + 340 * Math.sin(Math.PI * 1.85), delay: 116 },
    // 第三層 (R=500) - 8人
    { x: centerX + 500 * Math.cos(Math.PI * 0.05), y: centerY + 500 * Math.sin(Math.PI * 0.05), delay: 120 },
    { x: centerX + 500 * Math.cos(Math.PI * 0.3), y: centerY + 500 * Math.sin(Math.PI * 0.3), delay: 124 },
    { x: centerX + 500 * Math.cos(Math.PI * 0.55), y: centerY + 500 * Math.sin(Math.PI * 0.55), delay: 128 },
    { x: centerX + 500 * Math.cos(Math.PI * 0.8), y: centerY + 500 * Math.sin(Math.PI * 0.8), delay: 132 },
    { x: centerX + 500 * Math.cos(Math.PI * 1.05), y: centerY + 500 * Math.sin(Math.PI * 1.05), delay: 136 },
    { x: centerX + 500 * Math.cos(Math.PI * 1.3), y: centerY + 500 * Math.sin(Math.PI * 1.3), delay: 140 },
    { x: centerX + 500 * Math.cos(Math.PI * 1.55), y: centerY + 500 * Math.sin(Math.PI * 1.55), delay: 144 },
    { x: centerX + 500 * Math.cos(Math.PI * 1.8), y: centerY + 500 * Math.sin(Math.PI * 1.8), delay: 148 },
  ];

  // 5. テロップのパースと文字表示 (132F開始)
  const telopStartFrame = 132;
  // 《人間》 などの強調構文をパース
  const segments = telopText.split(/(《|》)/);
  const charConfigs: Array<{char: string; isEmph: boolean; globalIndex: number}> = [];
  
  let isEmph = false;
  let globalIndex = 0;
  for (const part of segments) {
    if (part === '《') {
      isEmph = true;
    } else if (part === '》') {
      isEmph = false;
    } else {
      for (const ch of part) {
        charConfigs.push({
          char: ch,
          isEmph,
          globalIndex: globalIndex++,
        });
      }
    }
  }

  return (
    <PaperStage>
      {/* 1. ロボットアイコン (退場時は exitOpacity と exitTranslateY で動かす) */}
      {frame < 72 && (
        <div
          style={{
            position: 'absolute',
            left: centerX - 80,
            top: centerY - 80,
            opacity: robotOpacity * exitOpacity,
            transform: `translateY(${exitTranslateY}px)`,
            color: theme.ink,
          }}
        >
          <RobotIcon />
        </div>
      )}

      {/* 2. 朱色バツ印 */}
      {frame >= 24 && frame < 72 && (
        <div
          style={{
            position: 'absolute',
            left: centerX - 120,
            top: centerY - 120,
            opacity: exitOpacity,
            transform: `translateY(${exitTranslateY}px)`,
          }}
        >
          <CrossMark progress1={crossProgress1} progress2={crossProgress2} />
        </div>
      )}

      {/* 3. コネクションライン (人間ノード間をつなぐドット線) */}
      {frame >= 80 && (
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {humanNodes.map((node, i) => {
            const lineGrow = spring({
              frame: frame - node.delay,
              fps,
              config: {damping: 26, stiffness: 120},
            });
            const x2 = centerX + (node.x - centerX) * lineGrow;
            const y2 = centerY + (node.y - centerY) * lineGrow;
            return (
              <line
                key={`line-${i}`}
                x1={centerX}
                y1={centerY}
                x2={x2}
                y2={y2}
                stroke={theme.gold}
                strokeWidth="2.5"
                strokeDasharray="4,6"
                opacity={lineGrow * 0.7}
              />
            );
          })}
        </svg>
      )}

      {/* 4. 人間シルエット群 (同心円状の拡散フェードイン) */}
      {frame >= 80 &&
        humanNodes.map((node, i) => {
          const appear = spring({
            frame: frame - node.delay,
            fps,
            config: {damping: 24, stiffness: 100, mass: 0.8},
          });
          const opacity = interpolate(frame - node.delay, [0, 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          
          // 中心から少し飛び出して着地するようなイージング
          const scale = appear * 1.0;
          const translateX = (node.x - centerX) * (0.8 + 0.2 * appear);
          const translateY = (node.y - centerY) * (0.8 + 0.2 * appear);

          return (
            <div
              key={`human-${i}`}
              style={{
                position: 'absolute',
                left: centerX - 32,
                top: centerY - 32,
                opacity: opacity,
                transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                color: theme.ink,
              }}
            >
              <HumanIcon />
            </div>
          );
        })}

      {/* 5. 画面下部テロップ (132F以降、S2規定で1文字2Fずらしで出現) */}
      {frame >= telopStartFrame && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 120,
            textAlign: 'center',
            fontFamily: theme.fontMincho,
            fontSize: 52,
            letterSpacing: '0.14em',
            lineHeight: 1.6,
          }}
        >
          {charConfigs.map((cfg, i) => {
            const charOpacity = interpolate(
              frame,
              [telopStartFrame + cfg.globalIndex * 2, telopStartFrame + cfg.globalIndex * 2 + 8],
              [0, 1],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
            );
            
            // 強調された単語（《》で囲まれた部分）は金茶色にする
            return (
              <span
                key={i}
                style={{
                  opacity: charOpacity,
                  color: cfg.isEmph ? theme.goldDeep : theme.ink,
                  fontWeight: cfg.isEmph ? 700 : 400,
                  fontSize: cfg.isEmph ? '1.08em' : undefined,
                }}
              >
                {cfg.char}
              </span>
            );
          })}
        </div>
      )}

      <SourceNotes source={source} conceptual={conceptual} />
    </PaperStage>
  );
};
