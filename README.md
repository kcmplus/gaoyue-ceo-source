# 高玥集团 OA 工作台

维护仓库：[kcmplus/gaoyue-ceo-source](https://github.com/kcmplus/gaoyue-ceo-source)

在线演示：[打开工作台](https://kcmplus.github.io/gaoyue-ceo-source/)

中文全员办公原型，包含 CEO 总览、项目 OKR、每日工作、员工档案、行政事务、资产、财务办公、审批、通知制度及复盘。所有预填信息均为演示数据。数据保存在当前浏览器中，尚未提供真实账号、服务器保存或多人同步。

## 本地运行与维护

直接打开 `ceo-workbench/index.html` 即可体验。维护使用 Node.js 24，无需安装第三方依赖。

```sh
npm run build
npm test
```

- `npm run build`：依次运行四个构建器，更新 `index.html` 和验证用 `core.js`，生成 `dist/index.html`。
- `npm test`：构建、运行 17 组跨平台模型与模拟界面测试，检查重复构建及发布内容一致性。
- `npm run test:full`：旧版完整回归，包含依赖原开发机 Playwright/Edge 路径的浏览器测试；换机需先适配，未在 GitHub CI 中运行。

修改 `ceo-workbench/` 中对应模块，再构建、验证并提交。`index.html` 同时保留基础界面与模块插入位置，必须保留；`core.js` 为自动提取副本，不单独编辑。不要使用旧的一次性源码转换脚本。

## 发布

`main` 每次推送均触发自动构建和验证；通过后发布到 GitHub Pages。向 `main` 提交的 PR 只验证、不发布。发布失败可在 [Actions](https://github.com/kcmplus/gaoyue-ceo-source/actions/workflows/pages.yml) 查看。

部署只包含 `dist/index.html`，不包含测试、文档或浏览器数据。详见 [部署与回退说明](docs/github-pages.md)。

## 文件说明

- `ceo-workbench/`：应用、独立模块、构建器和验证脚本。
- `scripts/`：跨平台构建与 CI 验证入口。
- `.github/workflows/pages.yml`：自动验证与发布。
- `docs/superpowers/`：需求、实施计划及历史验证记录。
- `ceo-workbench/OA升级使用指南.txt`：操作说明。
- `source-integrity.json`：2026-10-18 原始交付包的校验清单，保留作历史记录；后续版本以 Git 提交为准。

更换网址会使用新的浏览器存储空间。旧站点的个人数据不会自动迁移，可使用应用已有的备份导出、导入功能迁移。
