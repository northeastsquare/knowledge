// 抽查页面里 a.cl 源码链接：行号存在，且该行附近（±3 行）出现链接文字里的符号名。
// 用法：node .claude/skills/paper-to-page/check-code-lines.mjs 页面.html [更多页面...]
import fs from 'node:fs';

const files = process.argv.slice(2);
if (!files.length) { console.error('用法: node check-code-lines.mjs <page.html>...'); process.exit(2); }

const cache = new Map();
async function raw(org, repo, sha, path) {
  const key = `${org}/${repo}/${sha}/${path}`;
  if (!cache.has(key)) {
    cache.set(key, fetch(`https://raw.githubusercontent.com/${key}`)
      .then(r => r.ok ? r.text() : null).then(t => t && t.split('\n')).catch(() => null));
  }
  return cache.get(key);
}

let bad = 0, ok = 0, skipped = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const re = /<a\b[^>]*class="cl"[^>]*>([\s\S]*?)<\/a>/g;
  for (const m of html.matchAll(re)) {
    const tag = m[0];
    const href = (tag.match(/href="([^"]+)"/) || [])[1] || '';
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    const g = href.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([0-9a-f]{7,40})\/([^?#]+)(?:\?[^#]*)?#L(\d+)/);
    if (!g) { console.log(`✗ ${file}: 不是固定 commit 的 GitHub 行链接: ${href}`); bad++; continue; }
    const [, org, repo, sha, path, lineStr] = g;
    const line = +lineStr;
    const lines = await raw(org, repo, sha, decodeURI(path));
    if (!lines) { console.log(`✗ ${file}: 取不到 ${path}@${sha.slice(0, 7)}`); bad++; continue; }
    if (line > lines.length) { console.log(`✗ ${file}: ${path}#L${line} 超出文件长度 ${lines.length}`); bad++; continue; }
    // 链接文字形如「setup:256」「DAggerKeyboardConfig:142」；冒号前若是标识符就核对
    const sym = text.split(':')[0].trim();
    if (!/^[A-Za-z_][\w.]*$/.test(sym) || /(^|\.)(py|js|ts|mdx?|ya?ml|json|cpp|h|rs|go)$/.test(sym)) { skipped++; continue; }
    const name = sym.split('.').pop();
    const win = lines.slice(Math.max(0, line - 4), line + 3).join('\n');
    if (win.includes(name)) ok++;
    else { console.log(`? ${file}: 「${text}」→ ${path}#L${line}: ${lines[line - 1].trim().slice(0, 80)}`); bad++; }
  }
}
console.log(`符号匹配 ${ok}，仅检查行号 ${skipped}，问题 ${bad}`);
process.exit(bad ? 1 : 0);
