import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { siteContent } from "./src/data/site.ts";
import rehypeImageLazy from "./src/lib/rehype-image-lazy.mjs";

// Build a { canonicalPath -> publishedAt (ISO 8601) } map for article URLs
const buildArticleLastmodMap = () => {
  const map = new Map();
  const collect = (items) => {
    if (!items) return;
    for (const item of items) {
      if (!item?.href || !item?.publishedAt) continue;
      // Only care about internal article paths like /zh/articles/xxx or /en/articles/xxx
      if (!/^\/(zh|en)\/articles\//.test(item.href)) continue;
      const normalized = item.href.replace(/\/$/, "");
      const iso = `${item.publishedAt}T00:00:00+08:00`;
      map.set(normalized, iso);
    }
  };
  for (const locale of Object.keys(siteContent)) {
    const c = siteContent[locale];
    collect(c.writings);
    for (const group of c.writingGroups || []) {
      collect(group.items);
    }
  }
  return map;
};

const articleLastmodMap = buildArticleLastmodMap();

export default defineConfig({
  site: "https://caozhiyi.cc",
  markdown: {
    rehypePlugins: [rehypeImageLazy]
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/layout-review(\/|$)/.test(page),
      serialize: (item) => {
        try {
          const url = new URL(item.url);
          const path = url.pathname.replace(/\/$/, "");
          const lastmod = articleLastmodMap.get(path);
          if (lastmod) {
            return { ...item, lastmod };
          }
        } catch {
          // fall through to default
        }
        return item;
      }
    })
  ]
});
