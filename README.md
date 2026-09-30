# 机器人学习知识库

VLA、强化学习、3D 视觉与数据论文的交互式研读网页。

**网页入口：[在线阅读知识库](https://northeastsquare.github.io/knowledge/)**

## 首次启用 GitHub Pages

本仓库是纯 HTML / JavaScript 静态站点，无需安装依赖或执行构建。

1. 确认网页文件及根目录的 `.nojekyll` 已提交并推送到 `master` 分支。
2. 打开仓库的 [Settings → Pages](https://github.com/northeastsquare/knowledge/settings/pages)。
3. 在 **Build and deployment** 中，将 **Source** 设为 **Deploy from a branch**。
4. 在 **Branch** 中选择 **master** 和 **/ (root)**，点击 **Save**。
5. 等待 [Actions](https://github.com/northeastsquare/knowledge/actions) 中的 **pages build and deployment** 成功，再访问上方网页入口。

注意：当前 GitHub 默认分支是 `main`，网页文件实际在 `master`。发布源应选择 `master`，不需要更改默认分支，也不需要创建 `gh-pages` 分支或个人访问令牌。

`.nojekyll` 告诉 GitHub Pages 直接发布静态文件，跳过 Jekyll 处理。发布入口是根目录的 `index.html`。

## 更新内容

以后将网页修改推送到 `master`，GitHub Pages 就会自动重新部署。

- 首页目录：`index.html`。
- 各页面的公共导航：`nav.js`。
- 论文原文：`pdfs/`。
- 新增文章时，将 HTML 放在根目录，并更新首页与公共导航。
- 站内链接使用相对路径，例如 `index.html`、`pi0-论文解读.html`、`pdfs/pi0.pdf`；不要写成本机磁盘路径或以 `/` 开头的路径。这样既能本地打开，也能在 `/knowledge/` 子路径下访问。中文文件名可以保留。

字体和部分图表库通过外部 CDN 加载，对应功能需要能够访问这些服务。

## 本地预览

可直接用浏览器打开 `index.html`。如果安装了 Python，也可以在仓库根目录运行：

```sh
python -m http.server 8000
```

然后访问 <http://localhost:8000/>。

## 常见问题

- **网页 404**：确认 Pages 发布源是 `master / (root)`，根目录存在 `index.html`，且 Actions 中部署成功。
- **更新未显示**：检查修改是否推送到了 `master`，等待部署成功后刷新浏览器。
- **PDF 404**：确认首页链接对应的 PDF 已提交到 `pdfs/`；只存在于本机的文件不会被发布。

参考：[GitHub Pages 发布源配置文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。
