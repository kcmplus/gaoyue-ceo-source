# GitHub Pages Maintenance Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline implementation, then an independent read-only review.

**Goal:** 使用用户指定的 `kcmplus/gaoyue-ceo-source` 仓库维护现有原型，让 main 修改经过构建与验证后自动部署。

**Architecture:** 保留已有应用和四个构建器。增加统一 Node 构建与跨平台验证入口；GitHub Actions 将只读验证与 Pages 发布分成两个任务，仅发布独立页面。

**Tech Stack:** Node.js 24、GitHub Actions、GitHub Pages；无需第三方 Node 依赖。

**Spec:** 用户 2026-10-29 的维护仓库和 main 自动发布指令；功能边界沿用 `../specs/2026-10-18-oa-prototype-upgrade-design.md`。

## Global Constraints

- 保留原型及历史，正式多用户后台不在本次范围。
- 远程写入使用已授权账号，不向用户索取聊天内密码或令牌。
- 不上传浏览器本地数据，不发布整个源码目录。
- Windows 特定浏览器测试保留为本机完整验证，不冒充 Ubuntu CI 已执行。

## Review Focus

- 只改独立模块时也必须构建并触发发布。
- PR 不得获得部署权限或发布到正式网址。
- 测试失败不得进入部署步骤。
- 重复构建及跨平台换行不得改变业务代码含义。
- 发布目录不得混入源码文档或本地数据。

## Task 1: 可重复构建与跨平台验证

Files: `scripts/build.mjs`, `scripts/verify-ci.mjs`, `package.json`, `.gitattributes`, `.gitignore`。

- [ ] 顺序运行四个构建器，生成限定的 `dist` 发布内容。
- [ ] 运行 17 组无浏览器依赖测试，验证重复构建与产物一致。
- [ ] 运行 `npm test` 并检查与现有应用的内容差异。

## Task 2: main 自动发布及维护交付

Files: `.github/workflows/pages.yml`, `README.md`, `docs/github-pages.md`。

- [ ] main 推送和手动触发部署，PR 仅验证；部署必须依赖验证成功。
- [ ] 记录运行、权限、发布和回退方式，独立复核配置。
- [ ] 在写入授权可用时推送并核查 Actions；否则交付已验证文件与明确权限阻塞，不声称新配置已上线。
