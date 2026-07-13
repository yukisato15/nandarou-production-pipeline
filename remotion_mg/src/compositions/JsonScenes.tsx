import React from 'react';
import {Series} from 'remotion';
import type {CalculateMetadataFunction} from 'remotion';
import '../kit/fonts';
import {resolveScenes, ScenesDoc} from '../kit/registry';

// JSON(ScenesDoc)を受け取り、レジストリのコンポーネントを並べて動画にする。
// 尺はJSONから自動計算。差し替えは `--props=./data/xxx.json` で可能。

export const calculateJsonScenesMetadata: CalculateMetadataFunction<ScenesDoc> = ({props}) => {
  const {scenes} = resolveScenes(props);
  const durationInFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
  return {durationInFrames};
};

export const JsonScenes: React.FC<ScenesDoc> = (doc) => {
  const {scenes} = resolveScenes(doc);
  return (
    <Series>
      {scenes.map((scene) => {
        const Comp = scene.component;
        return (
          <Series.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
            <Comp {...scene.props} />
          </Series.Sequence>
        );
      })}
    </Series>
  );
};
