import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader({
      // 保留 quicX 原始文件名作为路由（仅转小写），sidebar slug 与其保持一致
      generateId: ({ entry }) =>
        entry
          .split('.')
          .slice(0, -1)
          .join('.')
          .toLowerCase(),
    }),
    schema: docsSchema(),
  }),
};
