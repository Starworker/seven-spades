# 黑桃七 · Seven Spades

基于 Astro 7 的中文教程博客，使用 Markdown 管理内容，通过 GitHub Actions 部署到 GitHub Pages。

已实现首页、教程文章、分类与标签、About / Contact、RSS、Sitemap 和 404。内置四篇可替换的示例教程，支持文章目录、代码复制、草稿与精选文章。

支持暗黑模式与简体中文 / 繁體中文 / English。文章分别放在 `src/content/blog/zh-cn/`、`zh-tw/`、`en/`，同名文件对应不同语言版本。文章不自动翻译；公共界面使用语言字典。

## 快速开始

推荐 Node.js 24 LTS。

```sh
npm ci
npm run dev
```

开发服务器在后台运行：`npm run dev:status`、`npm run dev:logs`、`npm run dev:stop`。

```sh
npm run check
npm run build
npm run verify
npm run preview
```

## 内容与配置

- 网站信息：`src/config.ts`
- 文章：`src/content/blog/{zh-cn,zh-tw,en}/*.md`
- 图片：`public/images/`
- 部署：`.github/workflows/deploy.yml`

## 使用文档

请阅读 [完整使用文档](docs/使用文档.md)，包含发布文章、分类标签、配图、联系方式、GitHub Pages、自定义域名及常见问题。

仓库 Settings → Pages 的 Source 选择 GitHub Actions，再推送到 main。默认自动推导项目站路径；实际发布前请补充联系方式并审阅示例文章。
