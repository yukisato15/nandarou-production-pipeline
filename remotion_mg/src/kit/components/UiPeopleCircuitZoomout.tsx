import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig, Img, staticFile} from 'remotion';
import {z} from 'zod';
import {PaperStage, SourceNotes} from '../stages';
import {theme} from '../theme';

export const uiPeopleCircuitZoomoutSchema = z.object({
  source: z.string().optional(),
  conceptual: z.boolean().default(false),
});

type Props = z.infer<typeof uiPeopleCircuitZoomoutSchema>;

// C20のメッセージバブルデザインを踏襲
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
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const UiPeopleCircuitZoomout: React.FC<Props> = ({
  source,
  conceptual = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 150Fでアニメーションが完了し、以降は静止
  const activeFrame = Math.min(frame, 150);

  // カメラのズーム（引き）を廃止し、前カットC20と同一の等倍サイズ (1.0) で描画
  const zoom = 1.0;

  // メッセージ吹き出しのフェードアウト (0F〜100Fにかけて徐々に消える)
  const messagesOpacity = interpolate(activeFrame, [20, 90], [1.0, 0.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // フィギュア写真のフェードイン (10Fから70Fにかけて徐々に浮き出る)
  const circuitOpacity = interpolate(activeFrame, [10, 70], [0.0, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // S2中央2段テロップのフェードイン処理 (ズームに影響されない最前面固定配置)
  const text1Opacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const text2Opacity = interpolate(frame, [100, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // C20のラスト状態と同一の吹き出しデータ
  const messageTexts = [
    "ヤバいかも", "マジで!?", "本当!?", "嘘でしょ...", "これ知ってた？",
    "ヤバい", "これ本当なら...", "えっ、マジ？", "大変なことになってる",
    "拡散希望", "信じられない", "ニュースになってる！", "みんな気をつけて"
  ];

  const nodes = [
    { id: 0, parentId: null, x: 960, y: 120, textIdx: 0 },
    { id: 1, parentId: 0, x: 700, y: 230, textIdx: 1 },
    { id: 2, parentId: 0, x: 1220, y: 230, textIdx: 2 },
    { id: 3, parentId: 1, x: 480, y: 340, textIdx: 3 },
    { id: 4, parentId: 1, x: 820, y: 340, textIdx: 4 },
    { id: 5, parentId: 2, x: 1100, y: 340, textIdx: 5 },
    { id: 6, parentId: 2, x: 1440, y: 340, textIdx: 6 },
    { id: 7, parentId: 3, x: 300, y: 450, textIdx: 7 },
    { id: 8, parentId: 3, x: 580, y: 450, textIdx: 8 },
    { id: 9, parentId: 4, x: 720, y: 450, textIdx: 9 },
    { id: 10, parentId: 4, x: 900, y: 450, textIdx: 1 },
    { id: 11, parentId: 5, x: 1020, y: 450, textIdx: 2 },
    { id: 12, parentId: 5, x: 1200, y: 450, textIdx: 3 },
    { id: 13, parentId: 6, x: 1340, y: 450, textIdx: 4 },
    { id: 14, parentId: 6, x: 1620, y: 450, textIdx: 10 },
    { id: 15, parentId: 7, x: 160, y: 560, textIdx: 11 },
    { id: 16, parentId: 7, x: 340, y: 560, textIdx: 12 },
    { id: 17, parentId: 8, x: 460, y: 560, textIdx: 5 },
    { id: 18, parentId: 8, x: 620, y: 560, textIdx: 6 },
    { id: 19, parentId: 9, x: 700, y: 560, textIdx: 7 },
    { id: 20, parentId: 10, x: 940, y: 560, textIdx: 8 },
    { id: 21, parentId: 11, x: 980, y: 560, textIdx: 9 },
    { id: 22, parentId: 12, x: 1220, y: 560, textIdx: 1 },
    { id: 23, parentId: 13, x: 1300, y: 560, textIdx: 2 },
    { id: 24, parentId: 13, x: 1460, y: 560, textIdx: 3 },
    { id: 25, parentId: 14, x: 1580, y: 560, textIdx: 11 },
    { id: 26, parentId: 14, x: 1760, y: 560, textIdx: 12 },
    { id: 27, parentId: 15, x: 80, y: 670, textIdx: 0 },
    { id: 28, parentId: 15, x: 220, y: 670, textIdx: 4 },
    { id: 29, parentId: 16, x: 360, y: 670, textIdx: 5 },
    { id: 30, parentId: 17, x: 500, y: 670, textIdx: 6 },
    { id: 31, parentId: 24, x: 1420, y: 670, textIdx: 7 },
    { id: 32, parentId: 25, x: 1540, y: 670, textIdx: 8 },
    { id: 33, parentId: 26, x: 1700, y: 670, textIdx: 9 },
    { id: 34, parentId: 26, x: 1840, y: 670, textIdx: 10 },
    { id: 35, parentId: 18, x: 600, y: 670, textIdx: 1 },
    { id: 36, parentId: 23, x: 1320, y: 670, textIdx: 2 }
  ];

  return (
    <PaperStage>
      {/* A. ズームアウト影響を受けるカメラコンテナ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${zoom})`,
          transformOrigin: '960px 450px', // 人型の中心を基準に引く
          width: '100%',
          height: '100%',
        }}
      >
        {/* 1. 元のメッセージ接続線 (C20のラインが引いていきながら消える) */}
        {messagesOpacity > 0.01 && (
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
              opacity: messagesOpacity * 0.7,
            }}
          >
            {nodes.map((node) => {
              if (node.parentId === null) return null;
              const parent = nodes.find(n => n.id === node.parentId)!;
              return (
                <line
                  key={`line-parent-${node.id}`}
                  x1={parent.x}
                  y1={parent.y}
                  x2={node.x}
                  y2={node.y}
                  stroke={theme.gold}
                  strokeWidth="3"
                  strokeDasharray="4,6"
                />
              );
            })}
          </svg>
        )}

        {/* 2. メッセージ吹き出しバブル (ズームアウトしながらフェードアウト) */}
        {messagesOpacity > 0.01 && (
          <div style={{opacity: messagesOpacity}}>
            {nodes.map((node) => {
              const text = messageTexts[node.textIdx % messageTexts.length];
              return (
                <div
                  key={`bubble-zoom-${node.id}`}
                  style={{
                    position: 'absolute',
                    left: node.x,
                    top: node.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <MessageBubble text={text} />
                </div>
              );
            })}
          </div>
        )}

        {/* 3. 背景透過された人型ネットワークフィギュア写真 (C21_human_cutout.png) を描画 */}
        {circuitOpacity > 0.01 && (
          <div
            style={{
              position: 'absolute',
              left: 960,
              top: 450,
              transform: 'translate(-50%, -50%)',
              width: 1200, // 画面中央に程よい大きさで配置
              height: 800,
              opacity: circuitOpacity,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Img
              src={staticFile('c21/C21_human_cutout.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        )}
      </div>

      {/* B. ズーム影響を受けない固定S2テロップ配置 (番組中央2段仕様) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 120, // 下部Y: 800より少し上に固定配置
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'none',
        }}
      >
        {/* 上段 */}
        <div
          style={{
            opacity: text1Opacity,
            fontFamily: theme.fontMincho,
            fontSize: 42,
            fontWeight: 600,
            color: theme.ink,
            letterSpacing: '0.08em',
            textShadow: `2px 2px 0px ${theme.paper}, -2px -2px 0px ${theme.paper}, 2px -2px 0px ${theme.paper}, -2px 2px 0px ${theme.paper}`,
          }}
        >
          あなたの弱さではありません。
        </div>

        {/* 下段 */}
        <div
          style={{
            opacity: text2Opacity,
            fontFamily: theme.fontMincho,
            fontSize: 42,
            fontWeight: 600,
            color: theme.ink,
            letterSpacing: '0.08em',
            textShadow: `2px 2px 0px ${theme.paper}, -2px -2px 0px ${theme.paper}, 2px -2px 0px ${theme.paper}, -2px 2px 0px ${theme.paper}`,
          }}
        >
          人間の、
          <span style={{color: theme.red, fontWeight: 700, borderBottom: `3px solid ${theme.red}`, paddingBottom: 2}}>
            《仕様》
          </span>
          です。
        </div>
      </div>

      <SourceNotes source={source} conceptual={conceptual} />
    </PaperStage>
  );
};
