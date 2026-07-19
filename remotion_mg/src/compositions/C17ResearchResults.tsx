import '@fontsource/oswald/500.css';
import '@fontsource/oswald/600.css';
import '@fontsource/shippori-mincho/600.css';
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {PaperStage, SourceNotes} from '../kit/stages';
import {theme} from '../kit/theme';

export type C17ResearchResultsProps = {
  spreadPercent: number;
  reachMultiplier: number;
  reachPeople: number;
  source: string;
};

export const defaultC17ResearchResultsProps: C17ResearchResultsProps = {
  spreadPercent: 70,
  reachMultiplier: 6,
  reachPeople: 1500,
  source: 'Vosoughi, Roy & Aral (2018), Science',
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const CountStat: React.FC<{
  kicker: string;
  prefix: string;
  value: number;
  suffix: string;
  caption: string;
  from: number;
}> = ({kicker, prefix, value, suffix, caption, from}) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [from, from + 18], [0, 1], {...clamp, easing: ease});
  const count = interpolate(frame, [from + 2, from + 42], [0, value], {...clamp, easing: ease});

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        opacity: reveal,
        translate: `0 ${34 * (1 - reveal)}px`,
      }}
    >
      <div
        style={{
          color: theme.goldDeep,
          fontFamily: theme.fontMincho,
          fontSize: 29,
          fontWeight: 600,
          letterSpacing: '0.12em',
          marginBottom: 12,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          color: theme.red,
          fontFamily: theme.fontNumber,
          fontSize: 188,
          fontWeight: 600,
          letterSpacing: '-0.035em',
          lineHeight: 0.95,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{fontSize: 102, verticalAlign: '34px'}}>{prefix}</span>
        {Math.round(count)}
        <span style={{fontSize: 88, marginLeft: 10}}>{suffix}</span>
      </div>
      <div style={{height: 3, width: `${92 + 250 * reveal}px`, background: theme.gold, margin: '24px 0 20px'}} />
      <div
        style={{
          color: theme.ink,
          fontFamily: theme.fontMincho,
          fontSize: 40,
          fontWeight: 600,
          letterSpacing: '0.015em',
          lineHeight: 1.5,
          whiteSpace: 'pre-line',
        }}
      >
        {caption}
      </div>
    </div>
  );
};

const OpeningGraph: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 25], [1, 0], clamp);
  const lift = interpolate(frame, [0, 25], [0, -84], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fade, translate: `0 ${lift}px`}}>
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 94,
          color: theme.ink,
          fontFamily: theme.fontMincho,
          fontSize: 56,
          fontWeight: 600,
          letterSpacing: '0.14em',
        }}
      >
        ウソと本当の広がり方
      </div>
      <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1="180"
            x2="1640"
            y1={260 + 560 * t}
            y2={260 + 560 * t}
            stroke="rgba(14,15,16,0.22)"
            strokeWidth={t === 1 ? 3 : 1}
          />
        ))}
        <polyline
          points="180,764 423,730 667,696 910,668 1153,646 1397,630 1640,619"
          fill="none"
          stroke={theme.ink}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="180,764 423,708 667,630 910,529 1153,417 1397,327 1640,260"
          fill="none"
          stroke={theme.red}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="1640" cy="260" r="12" fill={theme.red} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 1666,
          top: 226,
          padding: '8px 22px',
          background: theme.red,
          color: theme.paper,
          borderRadius: 999,
          fontFamily: theme.fontMincho,
          fontSize: 30,
          fontWeight: 600,
        }}
      >
        ウソ
      </div>
    </div>
  );
};

export const C17ResearchResults: React.FC<C17ResearchResultsProps> = ({
  spreadPercent,
  reachMultiplier,
  reachPeople,
  source,
}) => {
  const frame = useCurrentFrame();
  const mainReveal = interpolate(frame, [18, 38], [0, 1], {...clamp, easing: ease});
  const politicsReveal = interpolate(frame, [108, 130], [0, 1], {...clamp, easing: ease});
  const barWidth = interpolate(frame, [116, 164], [0, 1], {...clamp, easing: ease});
  const pulse = interpolate(frame, [172, 188, 204], [1, 1.035, 1], clamp);

  return (
    <PaperStage>
      <OpeningGraph />

      <div
        style={{
          position: 'absolute',
          inset: '70px 104px 112px',
          display: 'flex',
          flexDirection: 'column',
          opacity: mainReveal,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div>
            <div
              style={{
                color: theme.goldDeep,
                fontFamily: theme.fontMincho,
                fontSize: 25,
                fontWeight: 600,
                letterSpacing: '0.16em',
                marginBottom: 8,
              }}
            >
              研究結果
            </div>
            <div
              style={{
                color: theme.ink,
                fontFamily: theme.fontMincho,
                fontSize: 58,
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              本当のニュースと比べると
            </div>
          </div>
          <div
            style={{
              color: theme.ash,
              fontFamily: theme.fontNumber,
              fontSize: 30,
              letterSpacing: '0.1em',
            }}
          >
            2006—2017
          </div>
        </div>

        <div style={{height: 2, background: theme.gold, margin: '26px 0 20px'}} />

        <div style={{display: 'flex', flex: 1, gap: 100}}>
          <CountStat
            kicker="拡散される可能性"
            prefix="+"
            value={spreadPercent}
            suffix="%"
            caption={'ウソは、7割も\n拡散されやすかった'}
            from={28}
          />
          <div style={{width: 1, alignSelf: 'stretch', background: 'rgba(169,129,74,0.45)', margin: '38px 0'}} />
          <CountStat
            kicker={`${reachPeople.toLocaleString('ja-JP')}人に届くまで`}
            prefix="×"
            value={reachMultiplier}
            suffix=""
            caption={'本当のニュースより\nおよそ6倍速かった'}
            from={54}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '240px 1fr 250px',
            alignItems: 'center',
            gap: 28,
            opacity: politicsReveal,
            scale: pulse,
          }}
        >
          <div
            style={{
              color: theme.ink,
              fontFamily: theme.fontMincho,
              fontSize: 39,
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            政治の話題
          </div>
          <div style={{height: 26, background: 'rgba(14,15,16,0.12)', overflow: 'hidden'}}>
            <div style={{height: '100%', width: `${barWidth * 100}%`, background: theme.red}} />
          </div>
          <div
            style={{
              color: theme.red,
              fontFamily: theme.fontMincho,
              fontSize: 35,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textAlign: 'right',
            }}
          >
            差が最大
          </div>
        </div>
      </div>

      <SourceNotes source={source} conceptual={false} />
    </PaperStage>
  );
};
