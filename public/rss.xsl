<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">

<xsl:output method="html" encoding="UTF-8" indent="yes"/>

<xsl:template match="/">
<xsl:variable name="isZh" select="rss/channel/language = 'zh-CN'"/>
<html lang="{rss/channel/language}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title><xsl:value-of select="rss/channel/title"/> · RSS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background: #f6f7f9; color: #1a1d23; line-height: 1.65;
    }
    main { max-width: 680px; margin: 0 auto; padding: 64px 24px 80px; }
    .kicker {
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: .75rem; letter-spacing: .14em; text-transform: uppercase;
      color: #5c6470; margin-bottom: 12px;
    }
    h1 { font-size: 1.75rem; font-weight: 700; letter-spacing: -.01em; }
    .desc { color: #5c6470; margin-top: 6px; }
    .panel {
      margin-top: 28px; padding: 20px 24px;
      background: #ffffff; border: 1px solid #e3e6ea; border-radius: 10px;
    }
    .panel p { font-size: .95rem; }
    .panel p + p { margin-top: 8px; }
    .url {
      margin-top: 14px; padding: 10px 14px;
      background: #f1f3f6; border: 1px dashed #c9ced6; border-radius: 8px;
    }
    .url code {
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: .85rem; word-break: break-all;
    }
    h2 { margin-top: 40px; font-size: 1.05rem; font-weight: 600; }
    ul.items {
      list-style: none; margin-top: 14px; background: #ffffff;
      border: 1px solid #e3e6ea; border-radius: 10px; overflow: hidden;
    }
    ul.items li {
      padding: 13px 20px; border-bottom: 1px solid #eef0f3;
      display: flex; justify-content: space-between; align-items: baseline; gap: 16px;
    }
    ul.items li:last-child { border-bottom: none; }
    ul.items a { color: #2456f0; text-decoration: none; font-weight: 500; font-size: .95rem; }
    ul.items a:hover { text-decoration: underline; }
    .date {
      font-family: ui-monospace, Menlo, Consolas, monospace;
      font-size: .75rem; color: #8a919c; white-space: nowrap;
    }
    footer { margin-top: 36px; font-size: .85rem; }
    footer a { color: #5c6470; text-decoration: none; }
    footer a:hover { color: #1a1d23; }
    @media (prefers-color-scheme: dark) {
      body { background: #0f1318; color: #e6e8ec; }
      .kicker, .desc, .date { color: #9aa3af; }
      .panel, ul.items { background: #161b22; border-color: #262c36; }
      .panel p + p { margin-top: 8px; }
      .url { background: #1c232d; border-color: #343c48; }
      .url code { color: #e6e8ec; }
      ul.items li { border-bottom-color: #20262e; }
      ul.items a { color: #7f9bff; }
      footer a { color: #9aa3af; }
      footer a:hover { color: #e6e8ec; }
    }
  </style>
</head>
<body>
  <main>
    <p class="kicker">RSS Feed</p>
    <h1><xsl:value-of select="rss/channel/title"/></h1>
    <p class="desc"><xsl:value-of select="rss/channel/description"/></p>

    <div class="panel">
      <xsl:choose>
        <xsl:when test="$isZh">
          <p>这是 <strong>RSS 订阅源</strong>——一个供阅读器读取的机器格式文件，不是普通网页，浏览器直接打开显示 XML 是正常现象。</p>
          <p>订阅方法：复制下方地址，粘贴到任意 RSS 阅读器（Feedly、Inoreader、NetNewsWire 等），新文章会自动推送。</p>
        </xsl:when>
        <xsl:otherwise>
          <p>This is an <strong>RSS feed</strong> — a machine-readable file for feed readers, not a regular web page. Seeing raw XML in the browser is expected.</p>
          <p>To subscribe: copy the address below and paste it into any feed reader (Feedly, Inoreader, NetNewsWire, etc.). New posts will be delivered automatically.</p>
        </xsl:otherwise>
      </xsl:choose>
      <div class="url"><code><xsl:value-of select="rss/channel/atom:link/@href"/></code></div>
    </div>

    <h2>
      <xsl:choose>
        <xsl:when test="$isZh">最新文章</xsl:when>
        <xsl:otherwise>Latest posts</xsl:otherwise>
      </xsl:choose>
    </h2>
    <ul class="items">
      <xsl:for-each select="rss/channel/item">
        <li>
          <a href="{link}"><xsl:value-of select="title"/></a>
          <span class="date"><xsl:value-of select="substring(pubDate, 6, 11)"/></span>
        </li>
      </xsl:for-each>
    </ul>

    <footer>
      <a href="{rss/channel/link}">
        <xsl:choose>
          <xsl:when test="$isZh">← 返回网站</xsl:when>
          <xsl:otherwise>← Back to site</xsl:otherwise>
        </xsl:choose>
      </a>
    </footer>
  </main>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
