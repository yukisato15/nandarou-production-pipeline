import React from 'react';
import {interpolate, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {PaperStage} from '../stages';
import {theme} from '../theme';

// 紙片の上の引用。歴史パートの逸話・発言に使う。
// image を指定すると人物写真などを左に添えられる(public/ 配下の相対パス)。
export const quoteSchema = z.object({
  text: z.string(),
  attribution: z.string().optional(), // 例: W・R・ハーストに帰される逸話
  note: z.string().optional(), // 例: 真偽は定かではない
  image: z.string().optional(), // 例: photos/ep01/hearst_portrait.jpg
  imageCaption: z.string().optional(), // 例: W・R・ハースト(1900年代)
});

export const Quote: React.FC<z.infer<typeof quoteSchema>> = ({
  text,
  attribution,
  note,
  image,
  imageCaption,
}) => {
  const frame = useCurrentFrame();
  const cardIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const textIn = interpolate(frame, [10, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const attrIn = interpolate(frame, [34, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <PaperStage>
      <div
        style={{
          position: 'absolute',
          left: image ? 200 : 260,
          right: image ? 200 : 260,
          top: 200,
          bottom: 200,
          backgroundImage: `linear-gradient(rgba(239, 234, 224, 0.9), rgba(239, 234, 224, 0.9)), url(${theme.paperWhite})`,
          backgroundSize: 'cover',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.2)',
          transform: 'rotate(-0.8deg)',
          opacity: cardIn,
          padding: '90px 110px',
          display: 'flex',
          alignItems: 'center',
          gap: 90,
        }}
      >
        {image ? (
          <div style={{flexShrink: 0, textAlign: 'center', opacity: textIn}}>
            <img
              src={staticFile(image)}
              style={{
                width: 380,
                height: 460,
                objectFit: 'cover',
                border: '14px solid #F6F2EA',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
                transform: 'rotate(1.2deg)',
                filter: 'grayscale(0.25) sepia(0.12) contrast(0.98)',
              }}
            />
            {imageCaption ? (
              <div
                style={{
                  fontSize: 22,
                  color: theme.ash,
                  marginTop: 20,
                  letterSpacing: '0.08em',
                }}
              >
                {imageCaption}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexGrow: 1,
          }}
        >
          <div
            style={{
              fontSize: image ? 48 : 54,
              lineHeight: 2.0,
              letterSpacing: '0.1em',
              fontWeight: 700,
              opacity: textIn,
            }}
          >
            {text}
          </div>
          <div style={{textAlign: 'right', opacity: attrIn, marginTop: 64}}>
            {attribution ? (
              <div style={{fontSize: 30, color: theme.ink2, letterSpacing: '0.12em'}}>
                — {attribution}
              </div>
            ) : null}
            {note ? (
              <div style={{fontSize: 22, color: theme.ash, marginTop: 14, letterSpacing: '0.08em'}}>
                {note}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PaperStage>
  );
};
