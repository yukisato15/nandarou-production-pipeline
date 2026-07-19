import {Composition, Still} from 'remotion';
import {C13AttentionFlow} from './compositions/C13AttentionFlow';
import {Ep01Thumbnail} from './compositions/Ep01Thumbnail';
import {calculateJsonScenesMetadata, JsonScenes} from './compositions/JsonScenes';
import {calculateTelopOverlayMetadata, TelopOverlay} from './compositions/TelopOverlay';
import {C06GreenPhoneScreens} from './compositions/C06GreenPhoneScreens';
import {PhoneCloudTransparent} from './compositions/PhoneCloudTransparent';
import {scenesDocSchema} from './kit/registry';
import {FakeThumbnail, ThumbnailStack} from './kit/components/ThumbnailStack';
import {PhoneFeedHesitation} from './kit/components/PhoneFeedHesitation';
import {NandarouKaitaiIdent, defaultIdentProps} from './compositions/NandarouKaitaiIdent';
import {IDENT_DURATION_FRAMES} from './ident/timing';
import demoDoc from '../data/ep02_demo.json';
import ep01Telops from '../data/ep01_telops.json';
import {EpisodeTitle} from './kit/components/EpisodeTitle';
import {RoomToneBackground} from './kit/components/RoomToneBackground';
import {C012WordGrowth, defaultC012Props} from './kit/components/C012WordGrowth';
import {C12FeedCounters, defaultC12FeedCountersProps} from './compositions/C12FeedCounters';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="C13AttentionFlow"
        component={C13AttentionFlow}
        durationInFrames={430}
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
      <Composition
        id="C012WordGrowth"
        component={C012WordGrowth}
        durationInFrames={288}
        fps={23.976}
        width={1920}
        height={1080}
        defaultProps={defaultC012Props}
      />
      <Composition
        id="C12FeedCounters"
        component={C12FeedCounters}
        durationInFrames={264}
        fps={23.976}
        width={1920}
        height={1080}
        defaultProps={defaultC12FeedCountersProps}
      />
      <Composition
        id="EpisodeTitle"
        component={EpisodeTitle}
        durationInFrames={144}
        fps={23.976}
        width={1920}
        height={1080}
        defaultProps={{
          episodeNumber: '#01',
          titleParts: ['ぜんぶ、', '売り物になっていく'],
          hudLabelTL: 'ANALYSIS MODE',
          hudLabelBR: 'EP-01',
        }}
      />
      <Still
        id="Ep01Thumbnail"
        component={Ep01Thumbnail}
        width={1280}
        height={720}
        defaultProps={{variant: 'A' as const}}
      />
      <Still
        id="C01SingleThumbnail"
        component={FakeThumbnail}
        width={1280}
        height={720}
        defaultProps={{image: 'c01/C01_thumb_01.png', index: 0}}
      />
      <Still
        id="RoomToneBackground"
        component={RoomToneBackground}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="C02PhoneFeedPreview"
        component={PhoneFeedHesitation}
        durationInFrames={240}
        fps={23.976}
        width={1920}
        height={1080}
        defaultProps={{
          images: [
            'c01/C01_thumb_01.png',
            'c01/C01_thumb_02.png',
            'c01/C01_thumb_03.png',
            'c01/C01_thumb_04.png',
            'c01/C01_thumb_05.png',
            'c01/C01_thumb_06.png',
            'c01/C01_thumb_07.png',
            'c01/C01_thumb_08.png',
          ],
          heroImage: 'c02/ep01_thumb_E_dark_clean.png',
          bg: 'roomtone' as const,
          audioPreview: false,
        }}
      />
      <Composition
        id="C02PhoneFeedSfxPreview"
        component={PhoneFeedHesitation}
        durationInFrames={240}
        fps={23.976}
        width={1920}
        height={1080}
        defaultProps={{
          images: [
            'c01/C01_thumb_01.png',
            'c01/C01_thumb_02.png',
            'c01/C01_thumb_03.png',
            'c01/C01_thumb_04.png',
            'c01/C01_thumb_05.png',
            'c01/C01_thumb_06.png',
            'c01/C01_thumb_07.png',
            'c01/C01_thumb_08.png',
          ],
          heroImage: 'c02/ep01_thumb_E_dark_clean.png',
          bg: 'roomtone' as const,
          audioPreview: true,
        }}
      />
      <Composition
        id="C01ThumbnailStackPreview"
        component={ThumbnailStack}
        durationInFrames={120}
        fps={23.976}
        width={1920}
        height={1080}
        defaultProps={{
          images: [
            'c01/C01_thumb_01.png',
            'c01/C01_thumb_02.png',
            'c01/C01_thumb_03.png',
            'c01/C01_thumb_04.png',
            'c01/C01_thumb_05.png',
            'c01/C01_thumb_06.png',
            'c01/C01_thumb_07.png',
          ],
          bg: 'roomtone' as const,
        }}
      />
      <Composition
        id="C06GreenPhoneScreens"
        component={C06GreenPhoneScreens}
        durationInFrames={201}
        fps={25}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="PhoneCloudTransparent"
        component={PhoneCloudTransparent}
        durationInFrames={240}
        fps={25}
        width={1920}
        height={1080}
        defaultProps={{}}
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
      <Composition
        id="NandarouKaitaiLong"
        component={NandarouKaitaiIdent}
        durationInFrames={IDENT_DURATION_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{...defaultIdentProps, variant: 'long' as const}}
      />
      <Composition
        id="NandarouKaitaiStandard"
        component={NandarouKaitaiIdent}
        durationInFrames={IDENT_DURATION_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{...defaultIdentProps, variant: 'standard' as const}}
      />
      <Composition
        id="NandarouKaitaiShort"
        component={NandarouKaitaiIdent}
        durationInFrames={IDENT_DURATION_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{...defaultIdentProps, variant: 'short' as const}}
      />
      <Composition
        id="NandarouKaitaiSeOnly"
        component={NandarouKaitaiIdent}
        durationInFrames={IDENT_DURATION_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{...defaultIdentProps, audioMode: 'se-only' as const}}
      />
      <Composition
        id="NandarouKaitaiVoiceOnly"
        component={NandarouKaitaiIdent}
        durationInFrames={IDENT_DURATION_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{...defaultIdentProps, audioMode: 'voice-only' as const}}
      />
      <Composition
        id="NandarouKaitaiCompleteAudio"
        component={NandarouKaitaiIdent}
        durationInFrames={IDENT_DURATION_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{...defaultIdentProps, audioMode: 'complete' as const}}
      />
    </>
  );
};
