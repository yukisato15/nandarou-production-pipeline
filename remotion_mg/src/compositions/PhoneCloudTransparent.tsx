import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';

const THUMBS = [
  'c02/C01_single_01.png',
  'c02/C01_single_02.png',
  'c02/C01_single_03.png',
];

const TITLES = ['日本、終わる', '年金、消える', '知らないと損する'];
const PHONE_WIDTH = 250;
const PHONE_HEIGHT = 470;
const ROW_PITCH = 520;
const SPEED = 2.1;
const ROWS = 8;

type Pattern = 0 | 1 | 2 | 3;

const Meta: React.FC<{index: number}> = ({index}) => (
  <div style={{display: 'flex', gap: 7, padding: '7px 8px 9px', background: '#090909', color: '#fff'}}>
    <div style={{width: 18, height: 18, borderRadius: '50%', background: index === 0 ? '#e50012' : index === 1 ? '#ffd900' : '#ff6b35'}} />
    <div style={{minWidth: 0, fontSize: 10, lineHeight: 1.15, fontWeight: 800}}>
      <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{TITLES[index]}</div>
      <div style={{marginTop: 3, color: '#999', fontSize: 8, fontWeight: 500}}>仮動画チャンネル・おすすめ</div>
    </div>
  </div>
);

const Card: React.FC<{index: number; height?: number}> = ({index, height}) => (
  <div style={{width: '100%', background: '#111', overflow: 'hidden', marginBottom: 8}}>
    <Img src={staticFile(THUMBS[index % THUMBS.length])} style={{display: 'block', width: '100%', height: height ?? 126, objectFit: 'cover'}} />
    <Meta index={index % THUMBS.length} />
  </div>
);

const Phone: React.FC<{pattern: Pattern; phase: number}> = ({pattern, phase}) => {
  const order = [phase % 3, (phase + 1) % 3, (phase + 2) % 3];
  return (
    <div style={{width: PHONE_WIDTH, height: PHONE_HEIGHT, padding: 8, borderRadius: 36, background: '#090909', boxShadow: '0 18px 36px rgba(0,0,0,.28)', boxSizing: 'border-box'}}>
      <div style={{width: '100%', height: '100%', borderRadius: 29, overflow: 'hidden', background: '#090909', border: '2px solid #333'}}>
        <div style={{height: 26, background: '#080808', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', padding: '0 9px'}}>YouTube <span style={{marginLeft: 'auto', opacity: 0.8}}>⌕ ⋮</span></div>
        {pattern === 0 && <div style={{padding: 7}}>{order.map((i) => <Card key={i} index={i} />)}</div>}
        {pattern === 1 && <div style={{padding: 7}}><Card index={order[1]} height={150} /><Card index={order[2]} /><Card index={order[0]} /></div>}
        {pattern === 2 && <div style={{padding: 7}}><Card index={order[2]} /><Card index={order[0]} height={82} /><Card index={order[1]} height={82} /></div>}
        {pattern === 3 && <div style={{padding: 7, background: '#171717'}}><Card index={order[0]} height={100} /><Card index={order[2]} height={100} /><Card index={order[1]} height={100} /></div>}
      </div>
    </div>
  );
};

type Column = {x: number; direction: 1 | -1; phase: number; pattern: Pattern};
const COLUMNS: Column[] = [
  {x: 28, direction: 1, phase: 0, pattern: 0},
  {x: 416, direction: -1, phase: 1, pattern: 1},
  {x: 804, direction: 1, phase: 2, pattern: 2},
  {x: 1192, direction: -1, phase: 0, pattern: 3},
  {x: 1580, direction: -1, phase: 2, pattern: 1},
];

export const PhoneCloudTransparent: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'transparent', overflow: 'hidden'}}>
      {COLUMNS.map((column) => {
        // 画面内の端末を周期境界で一斉に入れ替えない。全尺をカバーする
        // 連続した行を置き、各端末が同じ画面のままフレームアウトする。
        const offset = frame * SPEED * column.direction + column.phase * 117;
        return (
          <div key={column.x} style={{position: 'absolute', left: column.x, top: -ROW_PITCH + offset}}>
            {Array.from({length: ROWS}, (_, row) => (
              <div key={row} style={{position: 'absolute', top: row * ROW_PITCH}}>
                <Phone pattern={column.pattern} phase={(column.phase + row) % 3} />
              </div>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
