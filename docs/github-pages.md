# GitHub Pages 部署

工作流：`.github/workflows/pages.yml`（Actions 中显示为 **Deploy OA to GitHub Pages**）。

## 首次启用

1. 将项目和工作流提交并推送到 GitHub 仓库的 `main` 分支。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
3. 打开 **Actions → Deploy OA to GitHub Pages → Run workflow**，选择 `main` 并运行。
4. 部署成功后，在工作流的 `github-pages` 环境链接或 **Settings → Pages** 中打开站点。

普通项目仓库的默认地址为 `https://<用户名或组织名>.github.io/<仓库名>/`，首页直接显示 OA 工作台。

## 后续更新

推送 `main` 时，修改 `ceo-workbench/index.html` 或工作流文件会自动部署；也可以手动运行。其他分支不会部署。

当前页面是自包含的静态 HTML，无需安装前端依赖。工作流仅打包 `ceo-workbench/index.html`，不发布开发脚本、验证报告和项目文档。

修改模块源码后，先按现有使用指南在仓库根目录构建，再将更新后的 `index.html` 一并提交：

```sh
node ceo-workbench/build-oa.mjs
node ceo-workbench/build-governance.mjs
node ceo-workbench/build-operations.mjs
node ceo-workbench/build-oa-upgrade.mjs
```

Pages 托管保留当前浏览器本地存储模式，不提供服务端或跨设备同步；原本在本地文件或其他域名录入的数据，需要通过页面的 JSON 导出、导入功能迁移。

配置依据：[GitHub 官方静态站点工作流](https://github.com/actions/starter-workflows/blob/main/pages/static.yml)。
