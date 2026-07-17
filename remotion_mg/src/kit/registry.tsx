import React from 'react';
import {z} from 'zod';
import {BarChart, barChartSchema} from './components/BarChart';
import {LineCompare, lineCompareSchema} from './components/LineCompare';
import {PhoneFeedHesitation, phoneFeedHesitationSchema} from './components/PhoneFeedHesitation';
import {Quote, quoteSchema} from './components/Quote';
import {StatCard, statCardSchema} from './components/StatCard';
import {Statement, statementSchema} from './components/Statement';
import {ThumbnailStack, thumbnailStackSchema} from './components/ThumbnailStack';
import {TitleCard, titleCardSchema} from './components/TitleCard';
import {EpisodeTitle, episodeTitleSchema} from './components/EpisodeTitle';

// Component Selectorの本体。
// AI(または人間)はこの一覧から type を選び、schema に合うpropsをJSONで書く。
// コードを書かせない。ここに無い画が必要になったら、コンポーネントを追加してから使う。

type Entry = {
  component: React.ComponentType<any>;
  schema: z.ZodTypeAny;
  defaultDurationInFrames: number;
  description: string; // AIのSelector向け説明
};

export const registry: Record<string, Entry> = {
  episode_title: {
    component: EpisodeTitle,
    schema: episodeTitleSchema,
    defaultDurationInFrames: 144,
    description: 'アイキャッチ直後の墨背景エピソードタイトル。HUD残滓から本編へ橋渡しする。',
  },
  title_card: {
    component: TitleCard,
    schema: titleCardSchema,
    defaultDurationInFrames: 96,
    description: '墨背景のタイトルカード。回タイトル・章見出しに。',
  },
  thumbnail_stack: {
    component: ThumbnailStack,
    schema: thumbnailStackSchema,
    defaultDurationInFrames: 120,
    description: '偽サムネPNGを7枚、手前から飛来させるC01フライスルー。',
  },
  phone_feed_hesitation: {
    component: PhoneFeedHesitation,
    schema: phoneFeedHesitationSchema,
    defaultDurationInFrames: 240,
    description: 'スマホYouTube風フィード。縦スクロール停止、指の逡巡、主役サムネ着弾。',
  },
  statement: {
    component: Statement,
    schema: statementSchema,
    defaultDurationInFrames: 120,
    description: '黒背景の★宣言(M6)。強調1語のみ金茶。結論・断言に。',
  },
  quote: {
    component: Quote,
    schema: quoteSchema,
    defaultDurationInFrames: 168,
    description: '紙片の上の引用。歴史上の発言・逸話に。帰属と真偽注記を付ける。',
  },
  stat_card: {
    component: StatCard,
    schema: statCardSchema,
    defaultDurationInFrames: 216,
    description: '研究・論文の要点カード。大きな数字/固有名(最大4つ)を順に提示。',
  },
  bar_chart: {
    component: BarChart,
    schema: barChartSchema,
    defaultDurationInFrames: 216,
    description: '紙資料風の横棒グラフ(最大6本)。数値比較・ランキングに。',
  },
  line_compare: {
    component: LineCompare,
    schema: lineCompareSchema,
    defaultDurationInFrames: 216,
    description: '折れ線の比較(最大3系列)。推移・「AがBを追い抜く」に。',
  },
};

export type SceneInput = {
  type: string;
  id?: string;
  durationInFrames?: number;
  props?: Record<string, unknown>;
};

export type ResolvedScene = {
  type: string;
  id: string;
  durationInFrames: number;
  component: React.ComponentType<any>;
  props: Record<string, unknown>;
};

export const scenesDocSchema = z.object({
  fps: z.number().positive().default(23.976),
  scenes: z
    .array(
      z.object({
        type: z.string(),
        id: z.string().optional(),
        durationInFrames: z.number().int().positive().optional(),
        props: z.record(z.string(), z.unknown()).default({}),
      })
    )
    .min(1),
});

export type ScenesDoc = z.infer<typeof scenesDocSchema>;

// JSON→シーン解決。schema違反はここで止める(AIへのフィードバック地点)。
export const resolveScenes = (docInput: unknown): {fps: number; scenes: ResolvedScene[]} => {
  const doc = scenesDocSchema.parse(docInput);
  const scenes = doc.scenes.map((s, i) => {
    const entry = registry[s.type];
    if (!entry) {
      throw new Error(
        `未知のシーンtype "${s.type}" (index ${i})。使用可能: ${Object.keys(registry).join(', ')}`
      );
    }
    const props = entry.schema.parse(s.props ?? {}) as Record<string, unknown>;
    return {
      type: s.type,
      id: s.id ?? `${s.type}_${i}`,
      durationInFrames: s.durationInFrames ?? entry.defaultDurationInFrames,
      component: entry.component,
      props,
    };
  });
  return {fps: doc.fps, scenes};
};
