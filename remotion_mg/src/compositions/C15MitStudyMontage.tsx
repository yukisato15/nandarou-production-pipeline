import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {PaperStage} from '../kit/stages';
import {theme} from '../kit/theme';

const enter = (frame: number, start: number, duration = 12) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const Metric: React.FC<{
  frame: number;
  start: number;
  label: string;
  kind: 'period' | 'news' | 'users' | 'tweets';
  accent?: boolean;
}> = ({frame, start, label, kind, accent}) => {
  const progress = enter(frame, start, 11);
  const count = interpolate(frame, [start + 5, start + 37], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const displayValue = (() => {
    if (kind === 'period') {
      return `2006〜${Math.round(interpolate(count, [0, 1], [2006, 2017]))}年`;
    }
    if (kind === 'news') {
      const current = Math.round(interpolate(count, [0, 1], [0, 126000]) / 1000) * 1000;
      const man = Math.floor(current / 10000);
      const remainder = current % 10000;
      return current < 10000
        ? `${current.toLocaleString('ja-JP')}件`
        : `約${man}万${remainder ? remainder.toLocaleString('ja-JP') : ''}件`;
    }
    if (kind === 'users') {
      const current = Math.round(interpolate(count, [0, 1], [0, 3000000]) / 10000) * 10000;
      return `約${Math.round(current / 10000)}万人`;
    }
    const current = Math.round(interpolate(count, [0, 1], [0, 4500000]) / 10000) * 10000;
    return `${Math.round(current / 10000)}万回${count === 1 ? '以上' : ''}`;
  })();
  return (
    <div
      style={{
        minWidth: 0,
        padding: '0 25px',
        borderLeft: `2px solid ${theme.goldDeep}`,
        opacity: progress,
        translate: `0px ${interpolate(progress, [0, 1], [24, 0])}px`,
      }}
    >
      <div
        style={{
          minHeight: 62,
          display: 'flex',
          alignItems: 'flex-end',
          fontSize: 27,
          fontWeight: 800,
          lineHeight: 1.3,
          letterSpacing: '0.025em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 16,
          fontFamily: theme.fontMincho,
          fontSize: displayValue.length > 10 ? 49 : 57,
          fontWeight: 800,
          lineHeight: 1,
          color: accent ? theme.red : theme.ink,
          letterSpacing: '-0.035em',
          whiteSpace: 'nowrap',
        }}
      >
        {displayValue}
      </div>
    </div>
  );
};

export const C15MitStudyMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const photo = enter(frame, 12, 26);
  const institute = enter(frame, 34, 14);
  const title = enter(frame, 57, 16);

  return (
    <PaperStage>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <div
          style={{
            position: 'absolute',
            left: interpolate(photo, [0, 1], [-650, 82]),
            top: interpolate(photo, [0, 1], [-310, 116]),
            width: interpolate(photo, [0, 1], [3180, 1000]),
            height: interpolate(photo, [0, 1], [1540, 486]),
            padding: interpolate(photo, [0, 1], [0, 16]),
            background: theme.paperLight,
            boxShadow: `0 24px 58px rgba(14,15,16,${interpolate(photo, [0, 1], [0, 0.2])})`,
            rotate: `${interpolate(photo, [0, 1], [-0.5, -1.4])}deg`,
          }}
        >
          <Img
            src={staticFile('assets/ep01/c15/C01500001.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'grayscale(1) contrast(1.12) sepia(0.16)',
              mixBlendMode: 'multiply',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 1138,
            top: 140,
            width: 710,
            opacity: institute,
            translate: `${interpolate(institute, [0, 1], [38, 0])}px 0px`,
          }}
        >
          <div
            style={{
              paddingBottom: 16,
              borderBottom: `3px solid ${theme.goldDeep}`,
              fontSize: 34,
              fontWeight: 800,
              lineHeight: 1.4,
              letterSpacing: '0.025em',
              whiteSpace: 'nowrap',
            }}
          >
            マサチューセッツ工科大学の研究
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 1138,
            top: 265,
            width: 710,
            opacity: title,
            translate: `0px ${interpolate(title, [0, 1], [28, 0])}px`,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.6,
              letterSpacing: '0.015em',
            }}
          >
            <span style={{color: theme.red}}>真実と虚偽</span>
            のニュースは、
            <br />
            オンラインでどう広がるか
          </div>
          <div
            style={{
              marginTop: 25,
              paddingTop: 16,
              borderTop: `1px solid ${theme.ash}66`,
              fontSize: 19,
              color: theme.ash,
              letterSpacing: '0.025em',
            }}
          >
            出典: Vosoughi, Roy &amp; Aral (2018), Science
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 82,
            right: 82,
            top: 692,
            display: 'grid',
            gridTemplateColumns: '1fr 1.24fr 1fr 1fr',
            columnGap: 20,
          }}
        >
          <Metric frame={frame} start={84} label="調査期間" kind="period" />
          <Metric frame={frame} start={106} label="真偽を検証したニュース" kind="news" accent />
          <Metric frame={frame} start={128} label="Twitter利用者" kind="users" />
          <Metric frame={frame} start={150} label="ツイート回数" kind="tweets" />
        </div>
      </AbsoluteFill>
    </PaperStage>
  );
};
