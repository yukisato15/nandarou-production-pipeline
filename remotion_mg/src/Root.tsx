import {Composition, Still} from 'remotion';
import {C13AttentionFlow} from './compositions/C13AttentionFlow';
import {Ep01Thumbnail} from './compositions/Ep01Thumbnail';
import {calculateJsonScenesMetadata, JsonScenes} from './compositions/JsonScenes';
import {calculateTelopOverlayMetadata, TelopOverlay} from './compositions/TelopOverlay';
import {scenesDocSchema} from './kit/registry';
import demoDoc from '../data/ep02_demo.json';
import ep01Telops from '../data/ep01_telops.json';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="C13AttentionFlow"
        component={C13AttentionFlow}
        durationInFrames={312}
        fps={23.976}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="JsonScenes"
        component={JsonScenes}
        fps={23.976}
        width={1920}
        height={1080}
        durationInFrames={1}
        schema={scenesDocSchema}
        defaultProps={demoDoc as never}
        calculateMetadata={calculateJsonScenesMetadata}
      />
      <Still
        id="Ep01Thumbnail"
        component={Ep01Thumbnail}
        width={1280}
        height={720}
        defaultProps={{variant: 'A' as const}}
      />
      <Composition
        id="TelopOverlay"
        component={TelopOverlay}
        fps={23.976}
        width={1920}
        height={1080}
        durationInFrames={1}
        defaultProps={ep01Telops as never}
        calculateMetadata={calculateTelopOverlayMetadata}
      />
    </>
  );
};
