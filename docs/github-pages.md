# GitHub Pages 部署与维护

仓库：`kcmplus/gaoyue-ceo-source`。生产分支：`main`。

演示网址：https://kcmplus.github.io/gaoyue-ceo-source/

工作流：`.github/workflows/pages.yml`（Actions 中显示为 **Deploy OA to GitHub Pages**）。

## 仓库设置

1. 将项目和工作流提交并推送到 GitHub 仓库的 `main` 分支。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
3. 打开 **Actions → Deploy OA to GitHub Pages → Run workflow**，选择 `main` 并运行。
4. 部署成功后，在工作流的 `github-pages` 环境链接或 **Settings → Pages** 中打开站点。

普通项目仓库的默认地址为 `https://<用户名或组织名>.github.io/<仓库名>/`，首页直接显示 OA 工作台。

修改 Pages 设置需要仓库管理权限；提交代码需要仓库写入权限及允许修改工作流的授权。若组织禁用了 Actions 或 Pages，由组织管理员启用。

## 后续更新

每次推送 `main` 均自动部署；也可以手动运行。独立模块、样式、构建器和首页的修改都会触发流程。PR 到 `main` 仅验证，其他分支不会部署。

流程先运行 `npm test`，依次执行四个构建器、17 组跨平台模型与模拟界面测试、重复构建和发布产物一致性检查。全部成功后，部署任务使用 `github-pages` 环境发布 `dist/index.html`，不发布开发脚本、验证报告和项目文档。

构建任务只有读取代码权限；只有部署任务申请 Pages 写入及身份令牌权限。无第三方 Node 依赖，不需要 `npm install`、个人令牌或额外部署密钥。

修改模块源码后，在仓库根目录使用 Node.js 24 构建、验证，再将更新后的 `index.html`、`core.js` 与模块一起提交，方便直接打开源码预览：

```sh
npm run build
npm test
```

CI 也会重新构建，避免漏提交生成文件导致发布旧功能。`npm test` 不使用原开发机的 Playwright/Edge 路径。旧版完整浏览器回归保留为 `npm run test:full`，不应将这 17 组 CI 检查误称为浏览器端完整验收。

## 失败与回退

- 构建或验证失败：本次不部署，查看失败步骤日志，修复后再次推送。
- Pages 设置或组织权限失败：检查上述设置，再重新运行工作流。
- 需要回退功能：用 Git revert 撤销造成问题的提交，再推送 `main`，自动重新验证并部署；不要强制重写远程历史。
- 发布目录只允许 `index.html`；发现额外文件会阻止打包，需要先检查来源。

Pages 托管保留当前浏览器本地存储模式，不提供服务端或跨设备同步；原本在本地文件或其他域名录入的数据，需要通过页面的 JSON 导出、导入功能迁移。

配置参考：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[deploy-pages](https://github.com/actions/deploy-pages)、[setup-node](https://github.com/actions/setup-node)。
