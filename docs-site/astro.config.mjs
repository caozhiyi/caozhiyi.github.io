import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import rehypeMermaid from 'rehype-mermaid';

// QuicX 文档站：部署于 https://caozhiyi.cc/docs/quicx/
// 内容由 scripts/inject-content.mjs 在构建期从 quicX 仓库注入，不进 git。
export default defineConfig({
  markdown: {
    // Astro 7 默认处理器（Sätteri）不支持 unified 插件；
    // 显式切换回 unified 管线以挂载 rehype-mermaid（构建期渲染 mermaid 为内联 SVG，
    // 需要 Playwright Chromium）。
    processor: unified({ rehypePlugins: [rehypeMermaid] }),
  },
  site: 'https://caozhiyi.cc',
  base: '/docs/quicx/',
  integrations: [
    starlight({
      title: 'QuicX',
      logo: { src: './logo.png' },
      description: 'C++17 QUIC / HTTP/3 协议栈工程文档',
      customCss: ['./src/styles/custom.css'],
      defaultLocale: 'zh',
      locales: {
        zh: { label: '简体中文', lang: 'zh-CN' },
        en: { label: 'English', lang: 'en' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/caozhiyi/quicX' },
      ],
      // logo 点击回到官网 Landing（覆盖默认跳语言根路径文档首页的行为）
      components: {
        SiteTitle: './src/components/overrides/SiteTitle.astro',
      },
      sidebar: [
        {
          label: '开始',
          translations: { en: 'Getting Started' },
          items: [
            { slug: 'overview', label: '项目总览', translations: { en: 'Overview' } },
            { slug: 'learning_path' },
            { slug: 'getting-started/quick_start' },
            { slug: 'getting-started/build' },
          ],
        },
        {
          label: '教程',
          translations: { en: 'Tutorials' },
          items: [
            { slug: 'tutorial/quic_api_guide' },
            { slug: 'tutorial/http3_api_guide' },
            { slug: 'tutorial/configuration_reference' },
          ],
        },
        {
          label: '架构设计',
          translations: { en: 'Architecture & Design' },
          items: [
            { slug: 'design/process_model' },
            { slug: 'design/udp_io' },
            { slug: 'design/connection_anatomy' },
            { slug: 'design/handshake_state_machine' },
            { slug: 'design/crypto_keying' },
            { slug: 'design/packet_lifecycle' },
            { slug: 'design/stream_state_machine' },
            { slug: 'design/loss_recovery' },
            { slug: 'design/congestion_control' },
            { slug: 'design/timer_design' },
            { slug: 'design/ownership_and_memory' },
            { slug: 'design/pool_allocator' },
            { slug: 'design/h3_connection' },
            { slug: 'design/qpack_dynamic_table' },
            { slug: 'design/upgrade_negotiation' },
            { slug: 'design/metrics' },
          ],
        },
        {
          label: '使用指南',
          translations: { en: 'Guides' },
          items: [
            { slug: 'guide/ci_local' },
            { slug: 'guide/perf_testing' },
            { slug: 'guide/interop_overview' },
            { slug: 'guide/interop_runbook' },
            { slug: 'guide/sanitizer_hello_world_load' },
            { slug: 'guide/sanitizer_file_transfer' },
          ],
        },
        {
          label: '参考手册',
          translations: { en: 'Reference' },
          items: [
            { slug: 'reference/api_stability' },
            { slug: 'reference/support_matrix' },
            { slug: 'reference/qlog_event_coverage' },
          ],
        },
        {
          label: '测试报告',
          translations: { en: 'Reports' },
          items: [
            { slug: 'reports/interop_status' },
            { slug: 'reports/performance_baseline' },
            { slug: 'reports/highbw_goodput_benchmark' },
          ],
        },
      ],
    }),
  ],
});
