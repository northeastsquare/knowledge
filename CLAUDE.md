# CLAUDE.md — 给 Claude Code 的仓库维护说明

这份文件是给 Claude Code（以及其他 AI 助手）看的操作手册。每次在这个仓库启动会话时
会自动读入，因此**换一台机器克隆仓库后，不需要再口头交代一遍**。

面向人类的介绍在 `README.md`，这里只写「怎么做」和「踩过的坑」。

---

## 1. 这是什么仓库

纯 HTML / JavaScript 静态站点，讲机器人学习（VLA、强化学习、3D 视觉、数据）的论文研读页。

- **没有构建步骤**：没有 npm install，没有打包，没有 CI 生成产物。
- **发布**：GitHub Pages，源为 `master / (root)`，`.nojekyll` 跳过 Jekyll 处理。
- **默认分支是 `master`**，不是 `main`。PR 的 base 要用 `master`。

所以：**改完文件直接提交推送就是发布**。不要引入构建工具、不要生成 `dist/`、
不要把 HTML 拆成需要编译的模板。`_study_template.html` 下划线开头，是手动复制用的
模板，不参与发布。

## 2. 新增一篇论文解读的标准动作

四步都做完才算完成，漏一步校验脚本会报错：

1. 在**仓库根目录**新建 HTML（中文文件名可以，保持现有命名风格，如
   `pi0.6-论文解读.html`）。可以从 `_study_template.html` 复制起步。
2. 在 `nav.js` 顶部的 `CATS` 数组里登记：选对分类，加一行
   `{ t: '显示标题', h: '文件名.html' }`。
3. 在 `index.html` 里加一个 `<a class="entry" href="文件名.html">` 卡片。分类与顺序
   跟导航保持一致。
4. 页面里必须引入 `concepts.css` 和 `nav.js`，并且至少有一个
   `<a class="concept-link">` 内联概念链接。

## 3. 路径规则

- **一律相对路径**：`pi0-论文解读.html`、`assets/katex/katex.min.css`、`pdfs/pi0.pdf`。
- **禁止** `/xxx` 开头的根相对路径。站点发布在 `/knowledge/` 子路径下，根相对路径会
  指向 `https://用户名.github.io/xxx` 而不是 `https://用户名.github.io/knowledge/xxx`，
  本地打开也会挂。校验脚本会直接报 `root-relative link`。
- 不要写本机磁盘路径。

## 4. 提交前必跑校验

```sh
node scripts/check-concept-links.mjs
```

无需安装依赖。它检查的东西比看上去多：

- 本地链接目标文件是否存在、锚点 id 是否存在
- 重复 id、嵌套 `<a>`
- 概念链接必须带锚点
- 每个页面是否引入 `concepts.css` / `nav.js`、是否有内联概念链接
- `nav.js` 里登记的每篇文章是否真实存在、`index.html` 是否有对应入口
- 每篇正式页面是否都在 `nav.js` 里登记
- **`concepts.html` 与 `index.html` 里写死的概念数量**是否与实际 `<article class="term-card">`
  数量、来源页面数一致

新增概念卡或新增页面后，记得同步更新这两处写死的数字，否则脚本报
`concept or source page count is out of date`。

## 5. 概念互链的做法

- 在真正解释概念的那个标题/段落上加 `id="concept-name"` 和 `class="concept-anchor"`。
- 正文里用 `<a class="concept-link" href="文章.html#concept-name">概念</a>` 引用。
- **保留旧锚点**，不要改名，避免已有链接失效。
- 优先链接第一次有意义的出现，不要每个重复词都链。
- 链接可以指向自测答案或折叠内容里的 `concept-*` 锚点——`nav.js` 的
  `revealConcept()` 会自动展开 `<details>`、`.qa`、`.card` 再滚动定位。所以不需要为了
  「让链接能用」而把答案区改成默认展开。

## 6. 数学公式怎么放（重点，踩过坑）

站内公式用 **KaTeX + auto-render**，写法是 `$$...$$`（块级）和 `$...$`（行内）。

**关键认知：KaTeX 是在浏览器里现场渲染的。** GitHub 的源码页面（`github.com` 上直接看
HTML 文件）以及 README 的 Markdown 预览，都不会执行这些 JS，所以公式一定显示成原始
LaTeX 源码。这是正常现象，不是 bug。要看到渲染结果必须走 GitHub Pages 的地址，或者本地
起服务：

```sh
python -m http.server 8000   # 然后访问 http://localhost:8000/
```

**当前各页面的实际状态**（别照着记忆改，先看文件）：

| 页面 | 公式方案 |
|---|---|
| `Gamma分布-等待时钟.html` | CDN：`cdn.jsdelivr.net/npm/katex@0.16.9/dist/...`（css + katex.min.js + auto-render.min.js） |
| `指数分布-等待的数学.html` | 同 CDN 方案 |
| `网页数学公式显示原理.html` | 两种都演示，正文本身也跑 CDN |
| `概率分布博物馆.html` | **完全离线**：CSS 用本地 `assets/katex/katex.min.css`，公式在文件里**预渲染成静态 HTML**（`<span class="katex">`），不依赖任何 JS |

**`assets/katex/` 是不完整的**：目前只有 `katex.min.css` 和 `fonts/`，**没有
`katex.min.js`，也没有 `contrib/auto-render.min.js`**。所以把某个页面的
`<link>/<script src>` 从 CDN 改成 `assets/katex/...` 会**更糟**——CSS 能加载但 JS 404，
公式彻底不渲染。要真离线，必须先把两个 JS 文件补进 `assets/katex/`。

**CDN 拉不下来时的表现**：页面显示 `$$ f(t) = \frac{...} $$` 原文。排查顺序：

1. 先验证网络可达性，再怀疑代码：
   ```sh
   curl -I https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js
   ```
   不通就是网络/代理问题，改代码没用。
2. 通了再查 `<script>` 标签是否完整、`renderMathInElement` 的 `delimiters` 配置。
3. 确认 `assets/` 没被 `.gitignore` 漏掉（当前无 `.gitignore`，无此风险）。

**选择建议**：新增页面沿用 CDN 方案（有三处现成范例，改起来省事）；只有当某个页面要求
「无网络也必须渲染」时才走博物馆那套预渲染 + 本地 CSS 的路子，那需要额外的构建脚本，
成本高得多。

CDN 版本号统一写 `katex@0.16.9`，跟现有页面保持一致。

## 7. 外部依赖清点

站点依赖这些外部域名，网络不通会缺字体或公式：

- `fonts.googleapis.com` / `fonts.gstatic.com` — 字体（IBM Plex、Noto Serif SC 等）
- `cdn.jsdelivr.net` — KaTeX
- `cdnjs.cloudflare.com`、`unpkg.com` — 少数页面引用的库

图表大量用内联 SVG / Canvas 手绘，没有依赖 d3/chart.js 之类的重型库，别主动引入。

## 8. 改代码时的风格约束

- 每个页面是**自包含**的单文件：样式写在自己的 `<style>` 里，逻辑写在自己的
  `<script>` 里。页面之间的主题差异是有意的（暗色终端风、纸张风、博物馆风），
  **不要为了「统一」把它们改成同一套样式**。
- 共享的只有三样：`nav.js`（导航）、`concepts.css`（概念链接样式）、`assets/katex/`。
- 中文正文，术语保留英文原文，代码和公式保持原样。
- 改动尽量局部化。用户经常只要求「修这一个页面的这个问题」，不要顺手重排别人的页面。

## 9. 提交习惯

- 提交信息用中文短句描述改了什么，例如 `完善概率教程、π0 解读与概念互链`。
- 提交前跑一遍 `node scripts/check-concept-links.mjs`，它通过再 push。
- 不要在未确认的情况下改写历史、强推、或删除 `pdfs/` 里的论文原文。
