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

// Normalize URL pathname to always end with a trailing slash (except for files with extensions),
// so sitemap URLs match GitHub Pages' 301-to-trailing-slash behavior.
const withTrailingSlash = (pathname) => {
  if (!pathname) return "/";
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname; // keep file paths like /rss.xml
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
};

export default defineConfig({
  site: "https://caozhiyi.cc",
  trailingSlash: "always",
  build: {
    format: "directory"
  },
  markdown: {
    rehypePlugins: [rehypeImageLazy]
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/layout-review(\/|$)/.test(page),
      serialize: (item) => {
        try {
          const url = new URL(item.url);
          const normalizedPath = withTrailingSlash(url.pathname);
          const normalizedUrl = `${url.origin}${normalizedPath}${url.search}${url.hash}`;
          const lookupPath = normalizedPath.replace(/\/$/, "");
          const lastmod = articleLastmodMap.get(lookupPath);
          const next = { ...item, url: normalizedUrl };
          if (lastmod) {
            next.lastmod = lastmod;
          }
          return next;
        } catch {
          // fall through to default
        }
        return item;
      }
    })
  ]
});
