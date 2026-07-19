import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {PaperStage, SourceNotes} from '../stages';
import {theme} from '../theme';

export const uiMessageBranchNetworkSchema = z.object({
  source: z.string().optional(),
  conceptual: z.boolean().default(false),
});

type Props = z.infer<typeof uiMessageBranchNetworkSchema>;

// チャット吹き出しバブル (CSSによる可変幅・VOX風二重影デザイン)
const MessageBubble: React.FC<{
  text: string;
  style?: React.CSSProperties;
}> = ({text, style}) => {
  return (
    <div style={{position: 'relative', display: 'inline-block', ...style}}>
      {/* 背面: 金茶影 */}
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: 8,
          right: -8,
          bottom: -8,
          backgroundColor: theme.goldDeep,
          borderRadius: '12px',
        }}
      />
      {/* 前面: メッセージバブル本体 */}
      <div
        style={{
          position: 'relative',
          border: `4px solid ${theme.ink}`,
          borderRadius: '12px',
          backgroundColor: theme.paper,
          padding: '10px 18px',
          fontFamily: theme.fontMincho,
          fontSize: 20,
          fontWeight: 600,
          color: theme.ink,
          whiteSpace: 'nowrap',
          boxShadow: 'none',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const UiMessageBranchNetwork: React.FC<Props> = ({
  source,
  conceptual = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 150Fで増殖が完全に停止し、150F〜240Fは静止（一時停止状態）
  const activeFrame = Math.min(frame, 150);

  const messageTexts = [
    "ヤバいかも", "マジで!?", "本当!?", "嘘でしょ...", "これ知ってた？",
    "ヤバい", "これ本当なら...", "えっ、マジ？", "大変なことになってる",
    "拡散希望", "信じられない", "ニュースになってる！", "みんな気をつけて"
  ];

  // 枝分かれツリーノードの座標データ (Y: 800以降の字幕領域を完全に避けて配置)
  const nodes = [
    // 第0世代 (1個)
    { id: 0, parentId: null, x: 960, y: 120, delay: 10, textIdx: 0 },
    
    // 第1世代 (2個)
    { id: 1, parentId: 0, x: 700, y: 230, delay: 24, textIdx: 1 },
    { id: 2, parentId: 0, x: 1220, y: 230, delay: 24, textIdx: 2 },
    
    // 第2世代 (4個)
    { id: 3, parentId: 1, x: 480, y: 340, delay: 38, textIdx: 3 },
    { id: 4, parentId: 1, x: 820, y: 340, delay: 38, textIdx: 4 },
    { id: 5, parentId: 2, x: 1100, y: 340, delay: 38, textIdx: 5 },
    { id: 6, parentId: 2, x: 1440, y: 340, delay: 38, textIdx: 6 },
    
    // 第3世代 (8個)
    { id: 7, parentId: 3, x: 300, y: 450, delay: 50, textIdx: 7 },
    { id: 8, parentId: 3, x: 580, y: 450, delay: 50, textIdx: 8 },
    { id: 9, parentId: 4, x: 720, y: 450, delay: 50, textIdx: 9 },
    { id: 10, parentId: 4, x: 900, y: 450, delay: 50, textIdx: 1 },
    { id: 11, parentId: 5, x: 1020, y: 450, delay: 50, textIdx: 2 },
    { id: 12, parentId: 5, x: 1200, y: 450, delay: 50, textIdx: 3 },
    { id: 13, parentId: 6, x: 1340, y: 450, delay: 50, textIdx: 4 },
    { id: 14, parentId: 6, x: 1620, y: 450, delay: 50, textIdx: 10 },
    
    // 第4世代 (12個)
    { id: 15, parentId: 7, x: 160, y: 560, delay: 60, textIdx: 11 },
    { id: 16, parentId: 7, x: 340, y: 560, delay: 60, textIdx: 12 },
    { id: 17, parentId: 8, x: 460, y: 560, delay: 60, textIdx: 5 },
    { id: 18, parentId: 8, x: 620, y: 560, delay: 60, textIdx: 6 },
    { id: 19, parentId: 9, x: 700, y: 560, delay: 60, textIdx: 7 },
    { id: 20, parentId: 10, x: 940, y: 560, delay: 60, textIdx: 8 },
    { id: 21, parentId: 11, x: 980, y: 560, delay: 60, textIdx: 9 },
    { id: 22, parentId: 12, x: 1220, y: 560, delay: 60, textIdx: 1 },
    { id: 23, parentId: 13, x: 1300, y: 560, delay: 60, textIdx: 2 },
    { id: 24, parentId: 13, x: 1460, y: 560, delay: 60, textIdx: 3 },
    { id: 25, parentId: 14, x: 1580, y: 560, delay: 60, textIdx: 11 },
    { id: 26, parentId: 14, x: 1760, y: 560, delay: 60, textIdx: 12 },
    
    // 第5世代 (10個)
    { id: 27, parentId: 15, x: 80, y: 670, delay: 68, textIdx: 0 },
    { id: 28, parentId: 15, x: 220, y: 670, delay: 68, textIdx: 4 },
    { id: 29, parentId: 16, x: 360, y: 670, delay: 68, textIdx: 5 },
    { id: 30, parentId: 17, x: 500, y: 670, delay: 68, textIdx: 6 },
    { id: 31, parentId: 24, x: 1420, y: 670, delay: 68, textIdx: 7 },
    { id: 32, parentId: 25, x: 1540, y: 670, delay: 68, textIdx: 8 },
    { id: 33, parentId: 26, x: 1700, y: 670, delay: 68, textIdx: 9 },
    { id: 34, parentId: 26, x: 1840, y: 670, delay: 68, textIdx: 10 },
    { id: 35, parentId: 18, x: 600, y: 670, delay: 68, textIdx: 1 },
    { id: 36, parentId: 23, x: 1320, y: 670, delay: 68, textIdx: 2 }
  ];

  return (
    <PaperStage>
      {/* 1. 枝分かれするコネクションライン (親吹き出しと子吹き出しを繋ぐ線) */}
      {activeFrame >= 10 && (
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
          {nodes.map((node) => {
            if (node.parentId === null) return null;
            const parent = nodes.find(n => n.id === node.parentId)!;
            
            // 子ノードの登場タイミングで親からの線が伸びる
            const lineGrow = spring({
              frame: activeFrame - node.delay,
              fps,
              config: {damping: 24, stiffness: 120},
            });

            if (activeFrame < node.delay) return null;

            // 親ノードから子ノードへの描画（徐々に伸びる）
            const x2 = parent.x + (node.x - parent.x) * lineGrow;
            const y2 = parent.y + (node.y - parent.y) * lineGrow;

            return (
              <line
                key={`line-${node.id}`}
                x1={parent.x}
                y1={parent.y}
                x2={x2}
                y2={y2}
                stroke={theme.gold}
                strokeWidth="3"
                strokeDasharray="4,6"
                opacity={lineGrow * 0.7}
              />
            );
          })}
        </svg>
      )}

      {/* 2. メッセージ吹き出しバブルの配置とポップアップ */}
      {nodes.map((node) => {
        // チラつき（ノイズ）防止のため、出現フレーム前の場合は完全にnullを返して描画から排除
        const nodeActiveFrame = activeFrame - node.delay;
        if (nodeActiveFrame < 0) return null;

        const pop = spring({
          frame: nodeActiveFrame,
          fps,
          config: {damping: 18, stiffness: 120, mass: 0.8},
        });
        const opacity = interpolate(nodeActiveFrame, [0, 8], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const scale = pop * 1.0;
        const text = messageTexts[node.textIdx % messageTexts.length];

        return (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: node.x,
              top: node.y,
              opacity: opacity,
              transform: `translate(-50%, -50%) scale(${scale})`, // 吹き出し中央を基準点にポップ
              transformOrigin: 'center center',
            }}
          >
            <MessageBubble text={text} />
          </div>
        );
      })}

      <SourceNotes source={source} conceptual={conceptual} />
    </PaperStage>
  );
};
