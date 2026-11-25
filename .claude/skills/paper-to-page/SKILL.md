---
name: paper-to-page
description: 把一篇论文（arXiv 链接 / 本地 PDF）和它的开源代码做成本知识库的中文交互式精读 HTML 页面。用户说「做个页面」「解读这篇论文」「把 xx 代码讲清楚」「加到知识库」时使用。
---

# 论文 + 代码 → 知识库精读页

目标读者：想快速读懂、记得住、愿意读完的人。页面要有趣、具体、能动手，不是论文翻译。

## 0. 先确认范围（一句话问清，能推断就不问）

- 论文地址（arXiv / OpenReview）和代码仓库；代码要钉到**固定 commit**（`git ls-remote <repo> HEAD` 拿 SHA）。
- 页面类型：精读页（默认）/ 对比页 / 发展历程页。
- 只讲论文、只讲代码，还是两者对照（默认对照）。

## 1. 读材料（省 token）

- 论文：WebFetch arXiv 的 HTML 版（`arxiv.org/html/<id>`），抓：要解决的问题、方法核心公式、算法伪代码、关键实验数字、局限。本地 `pdfs/` 里有 PDF 时可以读，但页面不能链接它。
- 代码：浅克隆到临时目录 `git clone --filter=blob:none <repo> %TEMP%\src-<name>`，再 `git checkout <SHA>`。先 `grep -n` 找到类名/函数名再局部读，不要整读大文件。
- 记一张「概念 → 文件:行号」表，后面写链接直接用。行号要在 checkout 后的源码里核对。

## 2. 规划页面（先在脑子里定稿，一次写完）

写之前列出：
1. **一句话主旨**：这篇论文到底改了什么、为什么有效。
2. **4–6 个「带着问题读」的问题**：选读者真会卡住的地方（为什么要这样设计？和 X 有什么区别？这个参数干什么的？），不是目录复述。
3. **章节顺序**：问题 → 直觉（小数字例子）→ 方法/公式 → 代码怎么实现 → 架构图 → 易混点 → 代码索引 → 巩固题。
4. **1–3 个 JS 小实验**：让机制动起来（拖滑块看损失/分布/轨迹变化、点按钮走一步算法）。实验输出的数字必须和正文说的一致，写完用 node 跑一下核对。
5. **视觉风格**：读 `references/style-registry.md`，选一个**没用过**的视觉隐喻（除非用户要求统一风格）。用完把新风格追加进登记表。

## 3. 写页面

先读样板 `DAgger-算法详解.html`（697 行；按 `grep -n "<h2\|<script"` 定位后分段读），照它的结构写。硬要求见 `AGENTS.md`，下面是检查清单：

### 结构
- `<head>`：`<title>`、`<meta name="description">`、Google Fonts、`<link rel="stylesheet" href="concepts.css">`；页尾 `<script src="nav.js"></script>`。
- 公式用本地 `assets/katex`（看已有页面怎么引），不要 MathJax CDN。
- 站内链接用相对路径，中文文件名可保留。文件名格式：`<名称>-论文解读.html` 或 `<名称>-算法详解.html`。

### 问答
- 开头 `<ol class="qs">`，每题 `<a class="go" href="#aN">→ 答案</a>`。
- 答案 `<div class="ans" id="aN"><b class="q">QN 答</b>…</div>` 放在正文讲到它的地方，不集中放。
- 结尾 `<ol class="quiz">` 5–8 题，每题 `<details><summary>看答案</summary><div>…<a href="#sX">回到第 X 节</a> 或源码链接</div></details>`。题目要考理解（换个参数会怎样、哪里会出错），不考背诵。

### 架构图（页面后部）
- `.wide` 容器里用绝对定位的 div 当框，SVG 画连线；文字可选中。
- 每个框带 `<a class="cl" href="https://github.com/<org>/<repo>/blob/<SHA>/<path>#L<行>" data-path="<path>" data-line="<行>">名字:行</a>`；`.md/.mdx` 文件加 `?plain=1`。不要 `vscode://`、不要本机路径。
- 论文出处 `<a class="pl" href="https://arxiv.org/abs/...">`。
- 编辑模式 + 保存：直接复用样板 `<script>` 里的 setEdit / serialize / idb / save 整段，只改 `COMMIT`、`GH` 和 IndexedDB 库名。保存时去掉 nav.js 注入的元素（`.kb-root`、head 里新增节点）和 `contenteditable`。

### 让人愿意读
- 每个抽象概念先给一个**具体小数字**的例子，再给公式。
- 公式下方用一句大白话解释每个符号；复杂推导配符号表。
- 一节只讲一件事，段落短；关键结论加粗；类比只在真能帮理解时用。
- 用表格对比「论文怎么写 / 代码怎么做」。
- 给页面起一个「外号」（首页 `kb-nick`，如「陪练教练」），好记。
- 中文写作避免套话、排比、「不是X而是Y」。

## 4. 注册与校验

1. `nav.js`：在合适分组的 `items` 里加 `{ t: '标题', h: '文件名.html' }`。
2. `index.html`：照 `HIL-SERL-算法详解.html` 那条 `<a class="entry">` 的格式加一条（ref、title + kb-nick + fmt、thesis、tags）。
3. 如果解释了新概念：在解释段落加 `id="concept-xxx" class="concept-anchor"`，并更新 `concepts.html`。
4. 跑校验：
   - `node scripts/check-concept-links.mjs`（站内链接、锚点、重复 id、nav/首页同步）
   - `node .claude/skills/paper-to-page/check-code-lines.mjs <页面.html>`（抽查 `a.cl` 指向的行确实包含链接文字里的符号名）
5. 用浏览器打开页面（tabbit skill 可截图）看一眼：实验能动、编辑保存可用、手机宽度不横向滚动。

## 5. 提交

直接在 `master` 上提交并推送 `origin master`（AGENTS.md 约定）。不要提交 `pdfs/`。提交信息格式参考 `git log --oneline -5`。
