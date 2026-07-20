import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {calculateJsonScenesMetadata, JsonScenes} from './compositions/JsonScenes';
import {scenesDocSchema} from './kit/registry';
import edogawaDoc from '../data/edogawa_city_hall_v01.json';

const EdogawaRoot: React.FC = () => {
  return (
    <Composition
      id="EdogawaCityHall"
      component={JsonScenes}
      fps={23.976}
      width={1920}
      height={1080}
      durationInFrames={1}
      schema={scenesDocSchema}
      defaultProps={edogawaDoc as never}
      calculateMetadata={calculateJsonScenesMetadata}
    />
  );
};

registerRoot(EdogawaRoot);
