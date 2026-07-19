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

// ダブルレイヤー透過ロボットアイコン（墨線画＋金茶ずらし影）
const RobotIcon: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{position: 'relative', width: 420, height: 420, ...style}}>
    {/* 背面: 金茶ベタ塗り影 (背景透過) */}
    <svg
      viewBox="0 0 100 100"
      width="420"
      height="420"
      style={{
        position: 'absolute',
        left: 28,
        top: 28,
        color: theme.goldDeep,
        fill: 'currentColor',
      }}
    >
      <rect x="22" y="28" width="56" height="48" rx="6" />
      <rect x="16" y="46" width="6" height="12" rx="1.5" />
      <rect x="78" y="46" width="6" height="12" rx="1.5" />
    </svg>
    
    {/* 前面: 墨線画 (背景透過) */}
    <svg
      viewBox="0 0 100 100"
      width="420"
      height="420"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        color: theme.ink,
      }}
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* アンテナ */}
      <line x1="50" y1="28" x2="50" y2="12" />
      <circle cx="50" cy="12" r="3" fill="currentColor" stroke="none" />
      {/* 頭部 */}
      <rect x="22" y="28" width="56" height="48" rx="6" />
      {/* 目 */}
      <circle cx="38" cy="48" r="4.5" fill="currentColor" stroke="none" />
      <circle cx="62" cy="48" r="4.5" fill="currentColor" stroke="none" />
      {/* 口 */}
      <line x1="38" y1="62" x2="62" y2="62" />
      {/* 耳/ネジ */}
      <rect x="16" y="46" width="6" height="12" rx="1.5" />
      <rect x="78" y="46" width="6" height="12" rx="1.5" />
    </svg>
  </div>
);

// ダブルレイヤー透過人間シルエットアイコン（墨線画＋金茶ずらし影）
const HumanIcon: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{position: 'relative', width: 100, height: 100, ...style}}>
    {/* 背面: 金茶ベタ塗り影 (背景透過) */}
    <svg
      viewBox="0 0 100 100"
      width="100"
      height="100"
      style={{
        position: 'absolute',
        left: 10,
        top: 10,
        color: theme.goldDeep,
        fill: 'currentColor',
      }}
    >
      <circle cx="50" cy="28" r="18" />
      <path d="M16 84 C16 62, 30 50, 50 50 C70 50, 84 62, 84 84 Z" />
    </svg>
    
    {/* 前面: 墨線画 (背景透過) */}
    <svg
      viewBox="0 0 100 100"
      width="100"
      height="100"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        color: theme.ink,
      }}
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    >
      <circle cx="50" cy="28" r="18" />
      <path d="M16 84 C16 62, 30 50, 50 50 C70 50, 84 62, 84 84 Z" />
    </svg>
  </div>
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
      width="560"
      height="560"
      stroke={theme.red}
      strokeWidth="10"
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

  // 4. 人間ノードの定義とズームアウトアニメーション
  // テロップ被りを防ぎつつ横に広げるため、中心座標を Y: 360 へ持ち上げ
  const centerX = 960;
  const centerY = 360;

  // 80Fから148Fにかけて、全体が超巨大な4.0倍（ズームイン）から1.0倍（ズームアウト）へ引きながら拡散していく
  const zoom = interpolate(frame, [80, 148], [4.0, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // X軸・Y軸の基本楕円半径（横幅を大きく広げ、縦幅はテロップ領域 Y: 800 以降を完全に避ける）
  const layers = [
    { Rx: 240, Ry: 100, count: 6, startDelay: 80, stepDelay: 2 },
    { Rx: 540, Ry: 220, count: 10, startDelay: 92, stepDelay: 2 },
    { Rx: 840, Ry: 340, count: 12, startDelay: 114, stepDelay: 3 }
  ];

  const humanNodes: Array<{
    id: string;
    layerIndex: number;
    nodeIndex: number;
    angle: number;
    Rx: number;
    Ry: number;
    delay: number;
  }> = [];

  layers.forEach((layer, lIdx) => {
    for (let i = 0; i < layer.count; i++) {
      const angle = (i * 2 * Math.PI) / layer.count;
      humanNodes.push({
        id: `node-${lIdx}-${i}`,
        layerIndex: lIdx,
        nodeIndex: i,
        angle,
        Rx: layer.Rx,
        Ry: layer.Ry,
        delay: layer.startDelay + i * layer.stepDelay,
      });
    }
  });

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
            left: centerX - 210, // 420pxの半分
            top: centerY - 210,
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
            left: centerX - 280, // 560pxの半分
            top: centerY - 280,
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
          {/* ① 中心からの放射状ライン */}
          {humanNodes.map((node, i) => {
            const lineGrow = spring({
              frame: frame - node.delay,
              fps,
              config: {damping: 26, stiffness: 120},
            });
            // ズームイン/ズームアウトに連動した端点座標の計算
            const currentRx = node.Rx * (lineGrow / zoom);
            const currentRy = node.Ry * (lineGrow / zoom);
            const x2 = centerX + currentRx * Math.cos(node.angle);
            const y2 = centerY + currentRy * Math.sin(node.angle);
            return (
              <line
                key={`line-radial-${i}`}
                x1={centerX}
                y1={centerY}
                x2={x2}
                y2={y2}
                stroke={theme.gold}
                strokeWidth="2.0"
                strokeDasharray="4,6"
                opacity={lineGrow * 0.5}
              />
            );
          })}

          {/* ② 同一層内の隣接ノード同士を繋ぐリング状ライン */}
          {humanNodes.map((node, i) => {
            const lIdx = node.layerIndex;
            const count = layers[lIdx].count;
            const nextIdx = (node.nodeIndex + 1) % count;
            const nextNode = humanNodes.find(n => n.layerIndex === lIdx && n.nodeIndex === nextIdx)!;
            
            const maxDelay = Math.max(node.delay, nextNode.delay);
            const lineGrow = spring({
              frame: frame - maxDelay,
              fps,
              config: {damping: 26, stiffness: 100},
            });

            if (frame < maxDelay) return null;

            // 各ノードの現在位置をズームを考慮して算出
            const r1x = node.Rx * (1 / zoom);
            const r1y = node.Ry * (1 / zoom);
            const x1 = centerX + r1x * Math.cos(node.angle);
            const y1 = centerY + r1y * Math.sin(node.angle);

            const r2x = nextNode.Rx * (1 / zoom);
            const r2y = nextNode.Ry * (1 / zoom);
            const x2_target = centerX + r2x * Math.cos(nextNode.angle);
            const y2_target = centerY + r2y * Math.sin(nextNode.angle);

            // 線が徐々に伸びるようにする
            const x2 = x1 + (x2_target - x1) * lineGrow;
            const y2 = y1 + (y2_target - y1) * lineGrow;

            return (
              <line
                key={`line-ring-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={theme.gold}
                strokeWidth="2.0"
                strokeDasharray="3,5"
                opacity={lineGrow * 0.6}
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
          
          // ズームイン/アウトに連動したスケール（登場時の最大4.0倍から1.0倍へ引く）
          const scale = appear * zoom;
          
          // ズームイン/アウトに連動した位置（最初は中心寄りで大きく、引くにつれて外側へ広がり小さくなる）
          const currentRx = node.Rx * (appear / zoom);
          const currentRy = node.Ry * (appear / zoom);
          const translateX = currentRx * Math.cos(node.angle);
          const translateY = currentRy * Math.sin(node.angle);

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: centerX - 50, // 100pxの半分
                top: centerY - 50,
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
