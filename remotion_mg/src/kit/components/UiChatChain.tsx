import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {PaperStage, SourceNotes} from '../stages';
import {theme} from '../theme';

export const uiChatChainSchema = z.object({
  messageText: z.string().default('これ、知ってた?'),
  source: z.string().optional(),
  conceptual: z.boolean().default(false),
});

type Props = z.infer<typeof uiChatChainSchema>;

// ダブルレイヤー透過人間シルエットアイコン
const HumanIcon: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{position: 'relative', width: 100, height: 100, ...style}}>
    {/* 背面: 金茶ベタ塗り影 */}
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
    
    {/* 前面: 墨線画 */}
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

// 吹き出し (ChatBubble): ゆったりした余白を持つVOX風バブル
const ChatBubble: React.FC<{
  text: string;
  style?: React.CSSProperties;
}> = ({text, style}) => {
  // 吹き出しバブルのパス (サイズ: 幅220px, 高さ95px、下部中央に突起)
  const pathData = "M 17 5 A 12 12 0 0 0 5 17 L 5 63 A 12 12 0 0 0 17 75 L 100 75 L 110 87 L 120 75 L 203 75 A 12 12 0 0 0 215 63 L 215 17 A 12 12 0 0 0 203 5 Z";
  
  return (
    <div style={{position: 'relative', width: 220, height: 95, ...style}}>
      {/* 背面: 金茶影 (背景透過) */}
      <svg
        viewBox="0 0 220 95"
        width="220"
        height="95"
        style={{
          position: 'absolute',
          left: 8,
          top: 8,
          color: theme.goldDeep,
          fill: 'currentColor',
        }}
      >
        <path d={pathData} />
      </svg>
      
      {/* 前面: 墨アウトライン ＋ 紙塗りつぶし */}
      <svg
        viewBox="0 0 220 95"
        width="220"
        height="95"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          color: theme.ink,
          fill: theme.paper,
        }}
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={pathData} />
      </svg>
      
      {/* 余白をしっかり確保した内包テキスト */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 12, // 吹き出し口の突起を考慮した垂直方向の調整
          fontFamily: theme.fontMincho,
          fontSize: 21, // 窮屈さをなくすため文字サイズを微調整
          fontWeight: 600,
          color: theme.ink,
          letterSpacing: '0.04em',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const UiChatChain: React.FC<Props> = ({
  messageText = 'これ、知ってた?',
  source,
  conceptual = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 画面中心および楕円パラメータ (C18の結末状態と完全に同期)
  const centerX = 960;
  const centerY = 360;

  const layers = [
    { Rx: 240, Ry: 100, count: 6, startDelay: 10, stepDelay: 2 },
    { Rx: 540, Ry: 220, count: 10, startDelay: 28, stepDelay: 2 },
    { Rx: 840, Ry: 340, count: 12, startDelay: 50, stepDelay: 3 }
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

  return (
    <PaperStage>
      {/* 1. コネクションライン (C18の最後と同じ網の目ネットワークが静止表示) */}
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {/* ① 放射状ライン */}
        {humanNodes.map((node, i) => {
          const x2 = centerX + node.Rx * Math.cos(node.angle);
          const y2 = centerY + node.Ry * Math.sin(node.angle);
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
              opacity={0.5}
            />
          );
        })}

        {/* ② リング状ライン */}
        {humanNodes.map((node, i) => {
          const lIdx = node.layerIndex;
          const count = layers[lIdx].count;
          const nextIdx = (node.nodeIndex + 1) % count;
          const nextNode = humanNodes.find(n => n.layerIndex === lIdx && n.nodeIndex === nextIdx)!;
          
          const x1 = centerX + node.Rx * Math.cos(node.angle);
          const y1 = centerY + node.Ry * Math.sin(node.angle);
          const x2 = centerX + nextNode.Rx * Math.cos(nextNode.angle);
          const y2 = centerY + nextNode.Ry * Math.sin(nextNode.angle);

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
              opacity={0.6}
            />
          );
        })}
      </svg>

      {/* 2. 人間シルエット群 (C18で拡散しきった状態で、0Fから静止表示) */}
      {humanNodes.map((node) => {
        const x = centerX + node.Rx * Math.cos(node.angle);
        const y = centerY + node.Ry * Math.sin(node.angle);
        return (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: x - 50,
              top: y - 50,
              color: theme.ink,
            }}
          >
            <HumanIcon />
          </div>
        );
      })}

      {/* 3. 吹き出し連鎖ポップアップ (ノードのdelay値に連動して順次出現) */}
      {humanNodes.map((node) => {
        // チラつき（ノイズ）防止のため、出現フレームに達していない場合は完全にnullを返して描画から排除
        const activeFrame = frame - node.delay;
        if (activeFrame < 0) return null;

        // 負のフレームがspringに渡るのを確実に防ぐ
        const bubbleAppear = spring({
          frame: activeFrame,
          fps,
          config: {damping: 18, stiffness: 120, mass: 0.8},
        });
        const opacity = interpolate(activeFrame, [0, 8], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const scale = bubbleAppear * 1.0;
        const x = centerX + node.Rx * Math.cos(node.angle);
        const y = centerY + node.Ry * Math.sin(node.angle);

        return (
          <div
            key={`bubble-${node.id}`}
            style={{
              position: 'absolute',
              left: x - 110, // 吹き出し幅220pxの半分
              top: y - 140, // 人間アイコン(100px)の頭上へ配置（高くなったバブル分調整）
              opacity: opacity,
              transform: `scale(${scale})`,
              transformOrigin: '110px 87px', // 吹き出し口の先端を基準点にして飛び出す
            }}
          >
            <ChatBubble text={messageText} />
          </div>
        );
      })}

      <SourceNotes source={source} conceptual={conceptual} />
    </PaperStage>
  );
};
