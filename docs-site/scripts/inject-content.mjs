// 构建期内容注入：从 quicX 仓库的 docs/ 目录生成 Starlight 内容集合。
//
// 用法: node scripts/inject-content.mjs <quicx-docs-dir> <target-dir>
//   <quicx-docs-dir>  quicX 仓库的 docs 目录（含 zh/、en/）
//   <target-dir>      本项目的 src/content/docs 目录
//
// 转换规则（只作用于注入副本，quicX 源文件零改动）：
//   1. 仅拷贝 zh/、en/，排除 internal/（内部评审）等其他内容
//   2. README.md 重命名为 index.md（Starlight 首页约定）
//   3. 为每个 markdown 注入 frontmatter title（取正文第一个 H1）
//      —— sidebar 的 slug 条目会自动用该 title 作为导航 label，
//         zh 文档显示中文标题、en 文档显示英文标题
//   4. 链接改写（quicX 文档以 .md 相对链接互链，Starlight 路由是目录形式）：
//      - 指向 docs 内 md 的链接  -> 站内相对路由（../design/foo.md -> ../design/foo/）
//      - README.md 链接          -> locale 根路由（../README.md -> ../）
//      - 指向仓库其他文件的链接   -> GitHub 绝对链接（../../src/x.h -> github blob URL）
//      - 无法解析的链接保留原样并告警
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const GITHUB_BASE = 'https://github.com/caozhiyi/quicX';
const GITHUB_BRANCH = 'main';

const [srcDocs, targetDocs] = process.argv.slice(2);
if (!srcDocs || !targetDocs) {
  console.error('Usage: node scripts/inject-content.mjs <quicx-docs-dir> <target-dir>');
  process.exit(1);
}
const srcRoot = resolveDir(srcDocs);
const repoRoot = dirname(srcRoot); // quicX 仓库根
// 目标目录无需存在：下方 rm+mkdir 会重建（CI 全新 checkout 中该目录不存在）
const outRoot = resolve(process.cwd(), targetDocs);

function resolveDir(p) {
  const abs = resolve(process.cwd(), p);
  if (!existsSync(abs)) {
    console.error(`Directory not found: ${p}`);
    process.exit(1);
  }
  return abs;
}

// 目标目录重建（幂等）
rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

for (const dir of ['zh', 'en']) {
  cpSync(join(srcRoot, dir), join(outRoot, dir), { recursive: true });
}

// logo 注入项目根（Starlight logo.src 的解析基准；.gitignore 排除，不进 git）
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const logoSrc = join(srcRoot, 'image', 'logo.png');
if (existsSync(logoSrc)) {
  cpSync(logoSrc, join(projectRoot, 'logo.png'));
  console.log('Injected logo -> logo.png');
}

const LINK_RE = /\]\(([^)\s]+)\)/g;
const warnings = new Set();
let injected = 0;
let renamed = 0;
let linksRewritten = 0;

/**
 * 查询路径在 git 对象库中的类型。
 * 稀疏克隆（CI 与本地都只 checkout docs/）下工作树没有 src/ 等文件，
 * existsSync 不可用；git ls-tree 直接查 HEAD 树，与 checkout 范围无关。
 * @returns 'blob' | 'tree' | null（不存在）
 */
const gitTypeCache = new Map();
function gitType(repoRoot, relPath) {
  const p = relPath.replace(/\/+$/, '');
  if (gitTypeCache.has(p)) return gitTypeCache.get(p);
  let type = null;
  try {
    const out = execSync(`git ls-tree HEAD -- ${JSON.stringify(p)}`, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const m = out.match(/^\d+ (\w+) [0-9a-f]+\t/);
    if (m) type = m[1];
  } catch {
    // git 不可用时退回文件系统判断
    if (existsSync(join(repoRoot, p))) type = 'blob';
  }
  gitTypeCache.set(p, type);
  return type;
}

/**
 * 改写 markdown 中的相对链接。
 * @param relFile 当前 md 相对 docs 根的路径（如 'zh/design/process_model.md'）
 */
function rewriteLinks(relFile, raw) {
  const fromDir = dirname(relFile);
  return raw.replace(LINK_RE, (full, href) => {
    if (/^(https?:|mailto:|#|\/)/.test(href)) return full;
    if (/^\.+$/.test(href.split('#')[0])) return full; // 正文省略号 "..." 等非路径文本
    const [pathPart, anchor] = href.split('#');
    if (!pathPart) return full;

    // 目标相对 docs 根的规范化路径
    const targetRel = normalize(join(fromDir, pathPart));

    // 站内路由仅限注入范围（zh/、en/ 内的 md）。
    // 越界链接（../CHANGELOG.md、internal/ 等）若在此命中，
    // 会生成指向不存在页面的路由（构建后 404）。
    const inScope = !targetRel.startsWith('..') && (targetRel.startsWith('zh/') || targetRel.startsWith('en/'));

    if (inScope && targetRel.endsWith('.md') && existsSync(join(srcRoot, targetRel))) {
      // 站内 md 互链 -> 目录形式路由
      let route = targetRel.slice(0, -3); // 去 .md
      if (route.endsWith('README')) {
        route = route.slice(0, -'README'.length).replace(/\/$/, ''); // README -> 目录本身
        if (route === '') route = '.';
      }
      let rel = relative(fromDir, route).replaceAll('\\', '/');
      if (!rel.startsWith('.')) rel = `./${rel}`;
      if (rel !== '.' && rel !== '..') rel = `${rel}/`;
      linksRewritten++;
      return `](${rel}${anchor ? `#${anchor}` : ''})`;
    }

    // 指向 docs 之外的仓库文件 -> GitHub 链接（查 git 对象库，兼容稀疏克隆）
    const repoTarget = normalize(join('docs', targetRel)).replaceAll('\\', '/');
    const type = gitType(repoRoot, repoTarget);
    if (type) {
      const verb = type === 'tree' ? 'tree' : 'blob';
      linksRewritten++;
      return `](${GITHUB_BASE}/${verb}/${GITHUB_BRANCH}/${repoTarget}${anchor ? `#${anchor}` : ''})`;
    }

    warnings.add(`${relFile}: unresolved link "${href}"`);
    return full;
  });
}

/** 递归处理注入副本：README.md -> index.md，注入 frontmatter，改写链接 */
function walk(dir, relBase) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      walk(full, rel);
      continue;
    }
    if (!entry.name.endsWith('.md')) continue;

    const raw = readFileSync(full, 'utf8');
    const isReadme = entry.name === 'README.md';
    // README 注入为 overview.md：/ 与 /en/ 路由留给 Landing 页，
    // overview slug 在 zh/en 对称，语言切换器可正常互切。
    const outPath = isReadme ? join(dir, 'overview.md') : full;
    const relForLinks = isReadme ? `${dirname(rel)}/overview.md` : rel;

    // 1. 链接改写（基于源位置语义）
    let body = rewriteLinks(relForLinks, raw);

    // 2. frontmatter title 注入
    const lines = body.split('\n');
    const hasFrontmatter = lines[0] === '---';
    let title = null;
    let h1Idx = -1;
    let fence = false; // 围栏代码块内的 “# xxx”（shell 注释）不是标题
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*(```|~~~)/.test(lines[i])) {
        fence = !fence;
        continue;
      }
      if (fence) continue;
      const m = lines[i].match(/^#\s+(.*)$/);
      if (m) {
        title = m[1].trim();
        h1Idx = i;
        break;
      }
    }
    if (!title) title = entry.name.replace(/\.md$/, '');
    // 站点已有语言切换器，标题中的语言后缀（如 “（中文）”“(English)”）属于冗余
    title = title.replace(/\s*[（(](?:中文|英文|Chinese|English)[)）]\s*$/i, '');

    // 3. 删除正文首个 H1——Starlight 已用 frontmatter title 渲染页头标题，避免重复
    if (h1Idx >= 0) lines.splice(h1Idx, 1);
    const stripped = lines.join('\n').replace(/^\n+/, '');

    // JSON 字符串是合法的 YAML 双引号标量，天然处理引号/反引号/Unicode 转义
    const fmTitle = `title: ${JSON.stringify(title)}`;
    let out;
    if (hasFrontmatter) {
      const fm = lines.slice(1, lines.indexOf('---', 1) > 0 ? lines.indexOf('---', 1) : lines.length);
      if (/^title\s*:/m.test(fm.join('\n'))) {
        out = stripped; // 已有 title，保留
      } else {
        out = ['---', fmTitle, ...lines.slice(1)].join('\n');
      }
    } else {
      out = ['---', fmTitle, '---', '', stripped].join('\n');
    }

    if (isReadme) rmSync(full);
    writeFileSync(outPath, out);
    if (isReadme) renamed++;
    injected++;
  }
}

walk(outRoot, '');

for (const w of warnings) console.warn(`WARN: ${w}`);
console.log(
  `Injected ${injected} markdown files (${renamed} README -> overview), rewrote ${linksRewritten} links` +
    (warnings.size ? `, ${warnings.size} unresolved warnings` : '')
);
