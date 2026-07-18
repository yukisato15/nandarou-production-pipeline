import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * C01/C02の透過素材の下に敷く共用ステージ。
 * カット本体へ背景を焼き込まないため、Premiere側で一枚だけ配置する。
 */
export const RoomToneBackground: React.FC = () => (
  <AbsoluteFill style={{background: '#0A0B0C', overflow: 'hidden'}}>
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse 130% 100% at 50% 46%, transparent 46%, rgba(0,0,0,.34) 100%)',
      }}
    />
    <AbsoluteFill
      style={{
        opacity: 0.09,
        backgroundImage: 'radial-gradient(rgba(234,230,223,.20) .65px, transparent .85px)',
        backgroundSize: '7px 7px',
        mixBlendMode: 'screen',
      }}
    />
  </AbsoluteFill>
);
