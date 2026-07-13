import React from 'react';
import {AbsoluteFill} from 'remotion';
import {theme} from './theme';

// LOOK層: 全シーン共通の「机とフィルム」。構図・素材はシーン側の責務。

const Grain: React.FC<{dark?: boolean}> = ({dark}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      backgroundImage: dark
        ? 'radial-gradient(rgba(234, 230, 223, 0.18) 0.7px, transparent 0.9px)'
        : 'radial-gradient(rgba(20, 20, 20, 0.22) 0.6px, transparent 0.8px)',
      backgroundSize: dark ? '8px 8px' : '7px 7px',
      mixBlendMode: dark ? 'normal' : 'multiply',
      opacity: dark ? 0.16 : 0.18,
    }}
  />
);

const Vignette: React.FC<{strength?: number}> = ({strength = 0.18}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse at center, transparent 55%, rgba(14, 15, 16, ${strength}) 100%)`,
    }}
  />
);

// 紙の上(データMG・引用など)
export const PaperStage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `linear-gradient(rgba(227, 222, 209, 0.72), rgba(227, 222, 209, 0.72)), url(${theme.paperTexture})`,
      backgroundSize: 'cover',
      fontFamily: theme.fontMincho,
      color: theme.ink,
    }}
  >
    {children}
    <Grain />
    <Vignette />
  </AbsoluteFill>
);

// 墨の上(タイトル・★宣言)
export const InkStage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill
    style={{
      background: theme.ink,
      fontFamily: theme.fontMincho,
      color: theme.white,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
    <Grain dark />
    <Vignette strength={0.3} />
  </AbsoluteFill>
);

// 出典・概念図の注記(番組ルール: データには常設)
export const SourceNotes: React.FC<{source?: string; conceptual?: boolean}> = ({
  source,
  conceptual,
}) => (
  <>
    {conceptual ? (
      <div
        style={{
          position: 'absolute',
          left: 90,
          bottom: 54,
          fontSize: 22,
          color: theme.ash,
          letterSpacing: '0.08em',
        }}
      >
        ※概念図(値は演出用)
      </div>
    ) : null}
    {source ? (
      <div
        style={{
          position: 'absolute',
          right: 90,
          bottom: 54,
          fontSize: 22,
          color: theme.ash,
          letterSpacing: '0.06em',
        }}
      >
        出典: {source}
      </div>
    ) : null}
  </>
);
