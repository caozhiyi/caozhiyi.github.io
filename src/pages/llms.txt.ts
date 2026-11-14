import type { APIRoute } from "astro";
import { siteContent } from "../data/site";

// llms.txt for AI crawlers (llmstxt.org convention).
// Generated from src/data/site.ts at build time so it never goes stale.
const BASE = "https://caozhiyi.cc";

export const GET: APIRoute = () => {
  const zh = siteContent.zh;
  const en = siteContent.en;

  const navHref = (nav: typeof zh.nav, re: RegExp) =>
    nav.find((n) => re.test(n.label))?.href ?? "";

  const zhArticles = navHref(zh.nav, /写作|文章/);
  const enArticles = navHref(en.nav, /Writing|Articles/);

  const bookLine = (b: (typeof zh.books)[number], locale: string) =>
    `- [${b.title}](${b.href}) (${locale}): ${b.description}`;

  const projectLine = (p: (typeof zh.projects)[number]) =>
    `- [${p.title}](${p.href}): ${p.description}`;

  const body = [
    `# ${zh.siteTitle} (${en.siteTitle}) — caozhiyi.cc`,
    "",
    `> ${zh.siteDescription}。${zh.homeTitle.split("·").slice(1).join("·").trim()}`,
    `> ${en.siteDescription}. ${en.homeTitle.split("·").slice(1).join("·").trim()}`,
    "",
    "## 入口 / Entries",
    "",
    `- 中文站: ${BASE}${zh.homePath}`,
    `- English: ${BASE}${en.homePath}`,
    "",
    "## 开源书 / Open-Source Books",
    "",
    "每本书均提供面向 AI 问答引擎的索引文件 `llms.txt`（全书目录与摘要），并附全文合并版 `llms-full.txt`。",
    "",
    ...zh.books.map((b) => bookLine(b, "中文")),
    ...en.books.map((b) => bookLine(b, "English")),
    "",
    "AI 索引 / AI indexes:",
    "",
    `- ${BASE}/ai-programming-book/llms.txt`,
    `- ${BASE}/ai-programming-book/en/llms.txt (English)`,
    `- ${BASE}/network-book/llms.txt`,
    "",
    "## 开源项目 / Open-Source Projects",
    "",
    ...zh.projects.map(projectLine),
    "",
    "## 写作 / Writing",
    "",
    ...(zhArticles ? [`- 文章索引: ${BASE}${zhArticles}`] : []),
    ...(enArticles ? [`- Articles index: ${BASE}${enArticles}`] : []),
    "",
    "## RSS",
    "",
    `- 中文: ${BASE}/zh/rss.xml`,
    `- English: ${BASE}/en/rss.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
