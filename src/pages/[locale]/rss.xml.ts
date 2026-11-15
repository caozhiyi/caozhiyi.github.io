import type { APIRoute } from "astro";
import { siteContent, type Locale } from "../../data/site";

export const getStaticPaths = () => {
  return (Object.keys(siteContent) as Locale[]).map((locale) => ({
    params: { locale }
  }));
};

const escapeXml = (unsafe: string) =>
  unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });

const toRfc822 = (isoDate: string) => {
  // Treat publishedAt as Asia/Shanghai (+08:00) midnight to keep the date stable
  const d = new Date(`${isoDate}T00:00:00+08:00`);
  return d.toUTCString();
};

export const GET: APIRoute = ({ params, site }) => {
  const locale = params.locale as Locale;
  const content = siteContent[locale];
  if (!content) {
    return new Response("Not Found", { status: 404 });
  }

  const siteUrl = site ? site.href.replace(/\/$/, "") : "https://caozhiyi.cc";
  const feedUrl = `${siteUrl}/${locale}/rss.xml`;
  const homeUrl = `${siteUrl}/${locale}/`;

  const titles = {
    zh: `${content.siteTitle} · 长期写作`,
    en: `${content.siteTitle} · Long-form Writing`
  } as const;

  type Item = { title: string; description: string; href: string; publishedAt?: string };
  const flatItems: Item[] = [
    ...content.writings,
    ...content.writingGroups.flatMap((g) => g.items)
  ] as Item[];

  // Deduplicate by href
  const seen = new Set<string>();
  const items = flatItems
    .filter((it) => {
      if (!it?.href || !it.publishedAt) return false;
      if (seen.has(it.href)) return false;
      seen.add(it.href);
      return true;
    })
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));

  const rssItemsXml = items
    .map((item) => {
      const link = item.href.startsWith("http") ? item.href : `${siteUrl}${item.href}`;
      return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${toRfc822(item.publishedAt!)}</pubDate>
      <description>${escapeXml(item.description || "")}</description>
    </item>`;
    })
    .join("");

  const nowRfc822 = new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(titles[locale])}</title>
    <link>${escapeXml(homeUrl)}</link>
    <description>${escapeXml(content.siteDescription)}</description>
    <language>${locale === "zh" ? "zh-CN" : "en"}</language>
    <lastBuildDate>${nowRfc822}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />${rssItemsXml}
  </channel>
</rss>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
};
