import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = fs.readdirSync(root).filter(name => name.endsWith('.html') && !name.startsWith('_'));
const pages = new Map();
const errors = [];
let localLinks = 0;
let conceptLinks = 0;
let inlineScripts = 0;

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)) result[match[1]] = match[3];
  return result;
}

for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const markup = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, match => match.slice(0, match.indexOf('>') + 1));
  const ids = new Set();
  const links = [];
  for (const tag of markup.matchAll(/<[a-z][^>]*>/gi)) {
    const attrs = attributes(tag[0]);
    if (attrs.id) {
      if (ids.has(attrs.id)) errors.push(`${file}: duplicate id ${attrs.id}`);
      ids.add(attrs.id);
    }
    if (attrs.href || attrs.src) links.push(attrs);
  }
  pages.set(file, { html, ids, links });
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = attributes(script[1]);
    if (attrs.src || (attrs.type && !['text/javascript', 'application/javascript'].includes(attrs.type))) continue;
    try { new vm.Script(script[2], { filename: file }); inlineScripts++; }
    catch (error) { errors.push(`${file}: ${error.message}`); }
  }
}

for (const [file, page] of pages) {
  for (const attrs of page.links) {
    const href = attrs.href || attrs.src;
    const isConcept = (attrs.class || '').split(/\s+/).includes('concept-link');
    if (isConcept) conceptLinks++;
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) continue;
    localLinks++;
    if (href.startsWith('/')) { errors.push(`${file}: root-relative link ${href}`); continue; }
    let url;
    try { url = new URL(href.replace(/&amp;/g, '&'), `https://example.test/knowledge/${encodeURIComponent(file)}`); }
    catch { errors.push(`${file}: invalid URL ${href}`); continue; }
    const target = decodeURIComponent(url.pathname.replace(/^\/knowledge\//, ''));
    const resolved = path.resolve(root, target);
    const relative = path.relative(root, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(resolved)) {
      errors.push(`${file}: missing local file ${href}`);
      continue;
    }
    if (url.hash && pages.has(target)) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!pages.get(target).ids.has(id)) errors.push(`${file}: missing anchor ${href}`);
    }
    if (isConcept && target !== 'concepts.html' && !url.hash) errors.push(`${file}: concept link needs a section anchor: ${href}`);
  }
  if (!page.html.includes('href="concepts.css"')) errors.push(`${file}: concept stylesheet missing`);
  if (!['index.html', 'concepts.html'].includes(file) && !page.links.some(a => (a.class || '').split(/\s+/).includes('concept-link'))) {
    errors.push(`${file}: no inline concept links`);
  }
}

const nav = fs.readFileSync(path.join(root, 'nav.js'), 'utf8');
new vm.Script(nav, { filename: 'nav.js' });
for (const match of nav.matchAll(/\bh:\s*'([^']+)'/g)) {
  if (!pages.has(match[1])) errors.push(`nav.js: missing article ${match[1]}`);
  if (!pages.get('index.html').links.some(l => l.href === match[1])) errors.push(`index.html: no entry for ${match[1]}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`OK: ${files.length} pages, ${localLinks} local links, ${conceptLinks} inline concept links, ${inlineScripts} inline scripts.`);
}
