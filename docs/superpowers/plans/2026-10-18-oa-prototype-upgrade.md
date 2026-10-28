# 高玥集团 OA 原型升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有原型升级为覆盖全员办公、日常与非日常工作、主管安排、联合验收、客观成果记录及分权办理的可交互 OA 原型。

**Architecture:** 保留单页原型和现有 Core 扩展机制，按人员权限、工作日历、工作任务、财务办公和通知制度拆分增量模块。原项目任务、人事事务、审批与私人待办各自保留权威记录，通过引用联动，避免重新建立平行数据。各批次共用同一人员、时间和权限契约，顺序实施并逐批验收。

**Tech Stack:** 原生 HTML/CSS/JavaScript、浏览器本地存储、Node.js 内置断言、现有浏览器验证工具；IANA 时区使用 Intl，不增加远程运行时依赖。

**Spec:** [已确认需求](../specs/2026-10-18-oa-prototype-upgrade-design.md)。用户于2026年10月18日确认；本计划待审阅及选择执行方式。

## Global Constraints

- 保留中文、深青色风格、二级导航和现有可交互页面，在现有代码上增量升级。
- 全员登录在原型中通过演示账号或身份入口体验。数据继续保存在当前浏览器，不建设真实认证、服务器权限隔离、跨设备同步或正式多人系统。
- 所有预填人员、日期、金额、排班和任务继续显著标注为演示数据。公开演示版本只包含示例，不上传本地浏览器中录入的内容。
- 附件继续使用名称、说明和资料链接展示；本轮不增加真实文件上传下载。已有备份恢复功能保留。
- 设备选择与手机端使用方式暂缓决定，保留现有响应式页面，不在本轮新建移动应用或采集设备、在线时间。
- 本轮处理 OA 工作管理、人事、行政和财务办公流程，不扩展商品采购交易、库存、销售、供应商分佣或门店经营系统。既有业务项目示例保留，不新增业务专属优化。
- 绩效记录仅包含及时性与实际成果，不增加质量评分或按任务数量生成员工排名。
- `sources/` 为只读；不修改同步资料。工作区根目录没有 Git 仓库，不擅自初始化；发布仓库 `sites/gaoyue-workbench` 仅在交付阶段更新。
- `index.html` 同时含基础源码和嵌入模块，不能删掉后从头生成；`core.js` 通过构建提取，不直接维护。
- 所有变更遵循现有克隆、校验、原子提交与存储冲突提示，拒绝操作不得部分写入；不使用 CEO 身份代替总经理实现权限。

## Review Focus

1. 老数据升级、重复加载和旧标签页：记录不丢失、不重复生成、不用陈旧副本覆盖新数据；任务1、3、10验证。
2. 未参加项目的主管、总经理与人事账号：必要工作可见，私人待办、敏感资料、未授权项目详情不泄露；任务1、5、10验证。
3. 跨夜班、中美夏令时、休假与模板修改重叠：同一次工作只生成一条，截止是同一个时刻，调整保留原依据；任务2、3、5验证。
4. 重复点击、共同验收改稿、批量确认中夹带无权项：不重复完成，旧确认不通过新稿，整批失败不部分提交；任务4、6验证。
5. 自己审批、审批人离职、币种混用和重复核销：不越权，不默认绕到 CEO，不超额办理，不混算金额；任务7验证。

---

## 实施顺序与文件职责

三批交付、同一范围：第一批任务1—4完成全员身份和每日工作；第二批任务5—6完成调配与验收；第三批任务7—10完成办公流程、总览和完整交付。每批都有可演示流程，不以静态入口代替操作。

| 文件 | 职责及变更方式 |
| --- | --- |
| `ceo-workbench/workforce-core.js`、`workforce-ui.js`（新增） | 人员类型、工作岗位、职责权限、主管关系、可见范围、HR任务体系入口。 |
| `ceo-workbench/work-calendar-core.js`（新增） | 固定工作日、班次、当地日期、绝对截止时刻与演示时钟；无 DOM 依赖。 |
| `ceo-workbench/work-tasks-core.js`、`work-tasks-ui.js`（新增） | 模板版本、主管分派、工作实例、每日引用、提交、支持申请、请假影响、验收及成果事实。 |
| `ceo-workbench/finance-office-core.js`、`finance-office-ui.js`（新增） | 四类财务办公、额度规则、关联审批、办理和核销记录。 |
| `ceo-workbench/notice-policy-core.js`、`notice-policy-ui.js`（新增） | 重要/普通通知、受众快照、版本确认、主管跟进。 |
| `ceo-workbench/oa-upgrade.css`（新增） | 新视图布局，复用原颜色和控件变量，选择器限定在对应模块内。 |
| `ceo-workbench/build-oa-upgrade.mjs`（新增） | 最后执行的幂等嵌入步骤；安装上述模块和 UI，提取完整 Core。 |
| `ceo-workbench/index.html`、`core.js` | 基础逻辑必要调整与构建输出；旧模块改动同时维护其独立源码。 |
| `ceo-workbench/{admin,member,governance,operations,oa}-core.js` 及对应 `-ui.js` | 仅修改新流程确实替换的权限、提交、审批、通知和展示入口，不重写无关功能。 |
| `ceo-workbench/navigation-ui.js`、`workload-ui.js` | 新入口与总经理可见性；受管理工作纳入工作量，复杂度不用于考评。 |
| `ceo-workbench/verify-oa-upgrade-fixture.mjs`（新增） | 新测试共用的 Core 加载器及确定性示例人员；与产品示例数据隔离。 |
| `ceo-workbench/verify-{workforce,work-calendar,work-tasks,work-acceptance,finance-office,notice-policy}.mjs`（新增） | 各领域状态、权限、时区与迁移测试。 |
| `ceo-workbench/verify-oa-upgrade-browser.mjs`（新增） | 新流程浏览器交互与身份切换回归；使用隔离存储。 |
| `ceo-workbench/browser-preview.mjs`（新增）及已有浏览器验证文件 | 共用仅服务原型的本地 HTTP 地址；替换旧验证的 file:// 导航，不改变其隔离浏览器存储。 |
| `ceo-workbench/verify-all.mjs`、已有验证文件 | 纳入新验证和完整构建链，更新被新需求取代的旧断言。 |
| `ceo-workbench/使用说明.txt`、`docs/validation/2026-10-18-oa-upgrade.md`（后者新增） | 使用方式、演示边界、验收场景及实测结果。 |

### 共享接口和数据约定

- `User={role:'ceo'|'manager'|'operator',person:string}` 保持兼容。`workforce.profiles[].kind` 新增 `ceo|general_manager|manager|operator|employee`；总经理映射既有 manager，普通员工映射 operator。界面显示真实岗位含义，不继续显示“仅思考型成员”。
- `members[].reportsTo`、`members[].projects`、项目负责人继续是主管/项目关系来源。`workforce.positions` 与 `positionAssignments` 管理工作岗位；既有 `admin.positions/assignments` 管理职能授权，二者不混用。
- `TaskRef={kind:'project'|'work',id:string}`：project 指向原 `d.tasks`；work 指向新增 `d.workTasks.items`（日常实例或无项目临时工作）。每日安排只存引用，不复制项目任务。
- `Context={now:string,zone:string}`，now 为带 Z 的 ISO 绝对时刻，zone 为 IANA 地区。新命令统一携带 `context`；旧命令仍支持 `asOf`，适配时显式使用原数据时区，不通过设备当前日期改写历史。
- `C.workTask(d,ref)` 返回原事项；`C.workCan(d,u,action,ref)` 校验读取/提交/安排/确认；`C.workFacts(d,u,context)` 返回按权限过滤的及时性和成果事实。读取不足时不返回正文、评论或资料链接。
- 新工作数据采用独立 schemaVersion，升级函数只补充缺失字段。模板/审批链/受众/提交成果均有版本快照；旧数据未知的提交时间显示“未记录”，不得伪造为升级时刻。
- 新写操作经 `C.change(d,u,{type,op,id,values,context})` 进入原子校验；type 使用 `workforce`、`work-calendar`、`work-tasks`、`finance-office`、`notice-policy`。UI 禁用和隐藏不能代替命令层权限检查。
- 工作附件为 `{name,note,url}`；文本转义，链接只允许 http/https。已有真实备份入口保留，不让附件入口冒充上传能力。
- 新测试 fixture 导出 `fixture()` → `{C,d,users,context}`；users 固定含 ceo、gm、supervisor、employee、hrAdmin、finance、outsider，员工直属 supervisor；context 为 `2026-10-18T01:00:00Z` / `Asia/Shanghai`。另导出 `run(d,u,type,op,values={},id,context)` 包装命令，所有测试各用新 fixture。
- `browser-preview.mjs` 导出 `startPreview()` → `Promise<{url,close}>`，只监听 `127.0.0.1` 临时端口，只提供 `/` 与 `/index.html`、禁止缓存，其他路径404。测试 finally 关闭 server/browser；同源多窗口测试共用一个预览实例，不访问用户持久化浏览器配置。

## Task 1：全员身份、岗位与权限基础

**Files:** 新增 workforce core/UI、fixture、`verify-workforce.mjs`、最终 builder；修改 admin/member/governance core/UI、navigation、index 基础身份入口。

**Interfaces:** `C.workforceKind(d,u)`、`C.workforceCan(d,u,capability)`、`C.directReports(d,u)`；capability 为 `company-work-read|template-publish|positions-manage|schedule-direct-reports`。`profile-save`、`position-save`、`position-assign`、`function-transfer` 命令。总经理有前两项；人员管理与岗位配置检查独立职能权限。

- [ ] 建立执行前源码快照，记录当前 index 摘要及发布版本；快照只含工作区文件，不读用户浏览器存储。由升级前 Core.seed 保存确定性旧数据 fixture，用它检验真实结构迁移，不仅删除新版 seed 的版本号。
- [ ] 在 `verify-workforce.mjs` 写失败测试 `legacy-upgrade-is-lossless`、`gm-is-global-not-sensitive`、`employee-without-project-can-use-oa`、`functional-role-transfer`，包含断言 `assert.deepEqual(after.memberWorkspace.todos,before.memberWorkspace.todos)`、`assert.equal(C.workforceCan(d,users.gm,'company-work-read'),true)`，并验证 GM 无财务授权时明细为空、outsider 不能读取其他项目。
- [ ] 运行 `node ceo-workbench/verify-workforce.mjs`，确认是新增接口/权限断言失败；不能把加载环境错误当作有效失败。
- [ ] 实现迁移、身份验证和上述接口；保留存量人员及档案。支持一人多人事/行政任职、财务分离；职能移交显示未办事项并重新指定办理人，历史保留原人员，不自动改变审批链。
- [ ] 对 `C.scoped`、projectDirectory、搜索/下拉、详情、历史、通知计数及导出逐项应用同一权限；主管不因 reportsTo 获得下属项目全文。保留成员本人的私人内容和敏感资料独立授权。项目外个人 OA 请求使用空项目关联，仍验证申请人/审批人/办理人范围。
- [ ] 增加演示身份入口与岗位任职界面，更新只允许思考型成员的旧限制。新增 builder 使用明确标记及唯一安装调用；按 `build-oa` → `build-governance` → `build-operations` → `build-oa-upgrade` 执行。
- [ ] 实现 startPreview 并让所有现有浏览器验证经该地址导航，包括含浏览器步骤的 `verify-management.mjs`；保留隔离 context、页面错误收集和 finally 清理。跨窗口验证共用同一个 origin。
- [ ] 运行新测试及 `verify-admin.mjs`、`verify-member.mjs`、`verify-governance.mjs`；更新旧“拒绝 SOP 员工”断言为“普通员工可办理本人事务且不能越权”。所有断言通过并保持私人数据不变。

## Task 2：工作日历、排班和统一时刻

**Files:** 新增 work-calendar core、`verify-work-calendar.mjs`；修改 workforce UI、builder、index 演示时间控件。

**Interfaces:** `C.workLocalDate(instant,zone):string`；`C.workInstant(date,time,zone,choice):string`，choice 为 `reject|earlier|later`；`C.workOccurrences(d,member,from,to):[{key,workDate,zone,startAt,endAt}]`。`calendar-save`、`shift-save` 命令仅由授权人员/直属主管修改适用范围。

- [ ] 写失败测试：固定周一至五排班不生成周日；上海周日22:00至次日06:00只生成一个班次；纽约夏令时缺失时间拒绝，重复时间必须选择先后。断言 `assert.equal(C.workInstant('2026-10-18','09:00','Asia/Shanghai','reject'),'2026-10-18T01:00:00.000Z')`，以及纽约 `2026-03-08 02:30` 抛错、`2026-11-01 01:30` 的两种选择相差一小时。
- [ ] 运行 `node ceo-workbench/verify-work-calendar.mjs`，确认预期失败。
- [ ] 实现地区时区换算和班次跨日边界；校验非法时区、重叠班次、结束早于开始但未勾选跨夜。固定工作日使用岗位所在地日历，班次 key 不随查看者时区变化。
- [ ] 实现日历/班次配置及日期、时刻、时区明确的演示时钟。共享截止在两个身份界面换算显示；不把美国全年写成固定 UTC 偏移。
- [ ] 构建后运行新测试，要求以上全部通过；旧日期迁移结果稳定，再次升级不改变截止或原记录。

## Task 3：岗位日常模板、主管安排和防重生成

**Files:** 新增 work-tasks core/UI、`verify-work-tasks.mjs`；修改 workforce UI、builder、oa-upgrade.css。

**Interfaces:** `C.workGenerate(d,u,{from,to,memberIds},context)` 经 `work-tasks/generate` 命令调用。`template-save|template-publish|allocation-save|template-apply` 命令；模板含版本、岗位、频率、成果要求和截止规则；安排含模板、人员、生效范围与优先级。

- [ ] 写 `only-ceo-gm-publish`、`supervisor-only-assigns-direct-reports`、`repeat-generation-is-idempotent`、`new-template-preserves-old-instance` 测试。对同一员工、模板和工作周期生成两次，断言 `assert.equal(d.workTasks.items.length,onceCount)`；修改模板后旧实例快照不变。
- [ ] 运行 `node ceo-workbench/verify-work-tasks.mjs` 确认新增行为失败。
- [ ] 实现模板草稿/发布/版本和主管分派。实例唯一键为模板 ID、员工 ID、执行周期 key，不含模板版本；新版本只作用尚未生成周期。已生成未完成项需要“查看影响→填写原因→明确应用”，已提交/完成项不得覆盖。
- [ ] 实现工作日/班次生成与缺配置反馈；休息日不生成任务，获批缺勤日保留受影响事项供主管处理，不自动算旷工或自动免执行。页面打开/切换演示日期可触发幂等生成，注明无后台定时服务。
- [ ] 人力资源增加“任务体系”页签：岗位、模板、分派、日历和执行记录；可实际新增、编辑、发布、分派和生成，不只展示示例表格。
- [ ] 构建并运行新测试；校验新模板禁止普通员工发布、直属主管不能给他人下属直接安排、历史版本可查看。

## Task 4：每日工作文档、提交与主管批量确认

**Files:** 修改 work-tasks core/UI、member UI、governance inbox、oa-upgrade.css；扩充 `verify-work-tasks.mjs`。

**Interfaces:** `C.workTask`、`C.workCan`；`adhoc-save|day-plan|submit|daily-review` 命令。`daily-review.values={member,workDate,decisions:[{ref,submissionId,decision:'accept'|'return',reason}]}`。日常状态 `pending|submitted|returned|confirmed|exempt`；提交追加 `{id,author,at,result,attachments,version}`。

- [ ] 写 `project-day-plan-is-a-reference`、`daily-review-is-atomic`、`private-todo-stays-private` 测试；断言当日安排前后 `d.tasks.length` 相同、非法混合批次 `assert.deepEqual(d,before)`、主管范围不含员工私人待办。
- [ ] 运行 `node ceo-workbench/verify-work-tasks.mjs`，确认新断言失败。
- [ ] 实现按日期分区的日常/非日常工作清单，非日常列表显示引用原任务。支持不关联项目的部门/岗位临时工作、明确协作者与检查人；未参与项目的主管仅见获授权的安排摘要。
- [ ] 接通完成要求、成果说明、资料链接、评论与变更历史。员工提交后标“已提交”，主管按员工/工作日批量确认，可单项退回；整批先校验权限和 submissionId，不处理过时成果，不重复追加确认。
- [ ] 接通统一待办和成员工作台，私人待办仍独立。保留原合同/档案/出勤入口，旧手工考核信息标明历史记录，不生成新质量评分。
- [ ] 构建并运行新测试和 `verify-member.mjs`；演示一组混合确认/退回、无项目临时事项完成、刷新保留成果和页面同步。

## Task 5：跨项目支持与缺勤影响处置

**Files:** 修改 work-tasks core/UI、operations core/UI、admin UI；扩充 `verify-work-tasks.mjs`。

**Interfaces:** `support-request|support-decide|absence-resolve` 命令；`C.workAbsenceImpact(d,u,requestId,context)` 返回授权范围内受影响引用及安排摘要。absence-resolve 的 disposition 为 `substitute|postpone|exempt`，必填原因、关联申请、相应代办人或新截止。

- [ ] 写 `support-does-not-grant-project-access`、`absence-three-dispositions`、`next-cycle-not-exempt` 测试。主管批准支持后断言 `assert.equal(C.readProject(d,users.supervisor,externalProjectId),false)`；日常本次免执行后下一周期仍正常生成。
- [ ] 运行新测试确认失败。
- [ ] 实现项目负责人提出人员/时段/优先级需求，直属主管统一确认或退回；仅参与双方获得待办。支持申请呈现必要摘要，不自动授予原项目、讨论或附件权限。
- [ ] 已批准请假/出差接通影响清单，按时间区间相交识别跨夜班。主管代办、延期、免执行保存原责任人/期限、原因与申请；复用代办接收流程，未接收显示待确认。非日常任务的免执行仅免本次每日安排，不把整个项目任务标成完成。
- [ ] 同时支持单项和同类批量处置，校验已提交/已验收任务不可被静默改写；改派后新负责人重新承诺，原成果作者不变。总体关键期限的改变仍走项目变更审批。
- [ ] 构建并运行新测试及 `verify-operations.mjs`；核对三种处置、代办未接收、跨时区缺勤和越权批量请求。

## Task 6：项目阶段、共同验收与客观成果台账

**Files:** 修改 work-tasks core/UI、governance core/UI、index 原提交/验收入口；新增 `verify-work-acceptance.mjs`。

**Interfaces:** `project-work-phase|joint-submit|joint-decide` 命令；phase 为 `construction|operation_innovation`，与生命周期分离。joint review 含目标 TaskRef 或 stageId、resultVersion、CEO及另一位 reviewer、双方决定及整改记录。`C.workFacts(d,u,context)` 输出 `{ref,submissionId,firstSubmittedAt,latestSubmittedAt,initialDeadlineAt,effectiveDeadlineAt,timeliness,acceptedAt}`，未知历史值返回 null。

- [ ] 写 `project-owner-checks-subtask`、`two-reviewers-one-result-version`、`timeliness-uses-submission`、`facts-no-parent-day-plan-double-count` 测试。双方之一通过时断言仍未验收；改稿后旧确认无效；截止前提交/截止后验收断言 `timeliness==='on_time'`。
- [ ] 运行 `node ceo-workbench/verify-work-acceptance.mjs` 确认失败。
- [ ] 项目增加建设/基本运作与创新阶段属性；负责人可自主拆分分派，目标/关键期限/预算变化保留授权审批。普通子任务由项目负责人检查，阶段成果由 CEO 与指定另一人分别确认，任一退回后进入整改，新版成果重新双确认。
- [ ] 确保同一成果只进入一种验收流程；历史已验收保留并标为旧流程，不补造第二位签名。更新现有 CEO 单人阶段验收命令和旧验证，不能保留绕过联合验收的入口。
- [ ] 更新 `verify-governance.mjs` 的“阶段通过必须依据当前标准”、`verify-governance-browser.mjs` 阶段验收流程、`verify.mjs` 普通任务验收和 `verify-management.mjs` 多级任务断言；保留当前标准变化需重提、叶子汇总、父任务不能提前验收，CEO 专属决策仍校验 CEO 权限。
- [ ] 实现成果台账：首次提交、补交、验收等待、授权延期并列；补交及时性独立。只汇总有实际提交的事实，排除日计划引用和派生父任务进度；不设置质量分数或数量排名。
- [ ] 构建并运行新测试及项目/governance 原验证；核对退回补交、重复确认、自我指定两次、旧数据缺少时间的显示。

## Task 7：四类财务办公与分权办理闭环

**Files:** 新增 finance-office core/UI、`verify-finance-office.mjs`；修改 oa/operations core/UI、governance 财务入口。

**Interfaces:** `finance-office/request|rule-save|decide|book` 命令；类型 `reimbursement|advance|payment|budget`。每项保留一个 `oaRequestId`，复用原 OA 审批事件/代理；`C.financeRoute(d,u,input)` 解析主管、财务和超额/特殊审批人并生成链快照。`book` 类型 `pay|return|writeoff|budget-apply`，金额使用币种最小单位整数，含唯一 bookingId。

- [ ] 写 `four-finance-kinds`、`over-budget-escalates`、`self-approval-blocked`、`duplicate-or-excess-booking-rejected`、`inactive-approver-needs-reassignment` 测试。断言审批通过不等于办结；归还加核销不得超过已发放；USD 申请引用 CNY 预算抛错且数据不变。
- [ ] 运行 `node ceo-workbench/verify-finance-office.mjs` 确认失败。
- [ ] 实现申请字段、财务规则（类型、币种、范围、额度、预算条件、特殊事项、角色/指定人员）；规则修改限 CEO 或明确授予财务规则管理权限者，总经理全局查看不附带此权。解析时排除申请人，找不到合规审批人则明确提示配置，不自动通过。保留规则和审批链快照，人员离职后通过显式重派处理剩余节点。
- [ ] 让新财务申请使用 financeRoute，既有通用 OA 继续用原 opsRule；同一申请不能被两套规则覆盖。审批与退回重提仍在原请求中，代理也不得形成自己审批自己。
- [ ] 实现财务办理、分次发放/付款、借款归还/核销、预算申请或调整。审批完成才允许相应办理，保留用途与依据；预算调整需新批准记录，不重写原预算；不触发银行交易或扩建会计系统。
- [ ] 构建并运行新测试及 OA/operations/governance 验证；演示四类完整流程、额度内与升级、缺少审批人和重复办理反馈。

## Task 8：通知制度版本、确认与主管跟进

**Files:** 新增 notice-policy core/UI、`verify-notice-policy.mjs`；修改 oa core/UI、governance inbox。

**Interfaces:** `notice-policy/publish|ack|remind` 命令；`C.noticePending(d,u,context)` 返回当前版本需本人确认事项。沿用 `d.oa.notices`，增加 `importance:'ordinary'|'important'`、`audienceScope` 和当版 resolvedAudience；每版保存生效时刻/阅读期限。

- [ ] 写 `ordinary-notice-needs-no-ack`、`new-version-needs-new-ack`、`supervisor-sees-only-direct-reports` 测试。断言普通通知不进入确认待办；重要通知确认后移除，新版再次出现；调岗不重写旧受众快照。
- [ ] 运行 `node ceo-workbench/verify-notice-policy.mjs` 确认失败。
- [ ] 实现按部门/岗位/人员解析受众、发布版本、确认和主管跟进。旧通知保留原需确认语义并标注继承；普通通知允许阅读但无需逐人确认。保留与原项目关联时的可见范围，不用通知泄露原项目内容。
- [ ] 接通集中制度资料入口、旧版本查看、页面内未确认提醒；提醒仅记录待办/提醒时间，不发送真实消息。发布权限沿用授权管理人员。
- [ ] 构建运行新测试和 OA 验证；核对新版内容、旧版确认历史、已离职人员与无项目员工访问。

## Task 9：全公司总览与完整入口联动

**Files:** 修改 workforce/work-tasks/finance-office/notice-policy UI、member/governance/operations UI、navigation/workload UI、oa-upgrade.css；新增 `verify-oa-upgrade-browser.mjs`。

**Interfaces:** 消费前述权限、workFacts、noticePending、统一 inbox；所有汇总从当前身份范围计算。负责人异常补充复用原报告，字段为异常、下一步、待决策，与项目关联；不要求重复填报系统已有进度。

- [ ] 编写浏览器场景：CEO/GM总览→模板→主管分派→员工每日清单→主管确认→成果台账；另验证普通员工只见本人相关事项。断言日常/非日常有清晰分区、点击汇总能打开原记录、私人待办不进入公司指标。
- [ ] 运行新浏览器测试，确认新增入口和闭环断言失败。
- [ ] CEO/GM总览增加工作、成果、异常、共同验收和重要通知概况；GM只读全局工作不隐式获得审批/财务明细。HR任务体系、成员工作台和统一待办展示同一来源，二级导航按身份收敛。
- [ ] 工作量纳入新任务但复杂度仍仅用于协商；无复杂度不估算负荷。保留原本周表格方案及项目全量按权限展示，不新增业务专属报表。
- [ ] 完善空状态、权限原因、未保存提醒、状态反馈、表单错误、重复提交保护；所有新增可见按钮有真实操作或明确不可用原因。状态同时使用文字和颜色。
- [ ] 构建并运行浏览器测试；通过本地 HTTP 预览人工检查桌面宽屏和较窄窗口：无横向溢出、弹窗可滚动、键盘焦点可见。不得通过其他工具绕过浏览器明确拒绝的 file:// 访问。

## Task 10：完整验证、说明、源码包与演示站更新

**Files:** 修改 `verify-all.mjs`、受新规则影响的旧验证、`使用说明.txt`；新增验证报告；交付阶段更新 `sites/gaoyue-workbench`、发布记录和源码包。

**Interfaces:** 完整构建链四步顺序执行；`node ceo-workbench/verify-all.mjs` 产生现有 validation-summary，新增各测试文件也纳入。发布结果需记录准确网址、版本与校验摘要。

- [ ] 更新总验证入口，在测试前先执行完整构建，并保留构建前后幂等比较。旧“拒绝普通员工”“CEO 单人阶段验收”“全部公告必须确认”等断言按批准规则更换，同时保留越权、存储冲突和恢复失败保护。
- [ ] 运行全部验证；出现失败先定位变更原因，不为通过而删除相关场景。必须覆盖需求确认稿15项场景，包括刷新持久化、两个窗口变更冲突、旧备份迁移、撤回/退回/补交、越权请求和空配置。
- [ ] 回归既有请假、出差、调休、入职、转岗、离职、交接，以及设备登记、领用、借还、维修、采购的审批与办理；验证全员入口、职能移交和不关联项目场景，同时保留旧财务计划/应收应付记录自身合理的项目必填校验。
- [ ] 对最终页面截图检查并完成一次独立整体验证；针对发现问题修复后只重跑受影响测试及最终总验证。记录实际命令、结果、发现及修复，未执行项明确列出。
- [ ] 更新使用说明，说明演示身份、浏览器本地数据、页面内生成/提醒、附件展示边界及无真实支付；为CEO/GM、主管、普通员工、人事行政、财务提供入口和完整操作路径。
- [ ] 制作新的源码包（源码、构建脚本、测试、说明、设计与计划），排除浏览器个人数据、凭据、临时环境和旧备份；验证解压后构建可运行，并为打包文件记录摘要。
- [ ] 按 Sites 技能使用既有演示站更新流程，仅同步干净示例版本。沿用用户已授予的公开演示发布范围；检查部署状态及远端实际页面，不把本地完成说成已上线。若发布不可用，仍交付本地可运行版并准确说明未更新远端。
- [ ] 打开可用原型，交付入口、源码包和简明验证结果；关闭本轮临时测试进程但不关闭用户已有页面。最终声明仅覆盖实际完成与验证的内容。

## 计划自检记录

- 需求覆盖：组织/权限→任务1；日历时区→任务2；模板与HR任务体系→任务3；每日清单/临时工作/私人内容→任务4；主管调配/缺勤→任务5；阶段/联合验收/及时性→任务6；财务四类→任务7；制度通知→任务8；管理总览与负责人补充→任务9；既有行政资产回归/数据迁移/完整交付→任务10。
- 接口一致：所有新命令携带 Context；TaskRef 不复制原项目任务；权限和事实数据通过统一接口读取。财务新路由与旧通用规则明确分流。
- 风险覆盖：Review Focus 的五项已分别写入所属任务的失败测试；新规则替代旧规则时同步更新旧测试，不能保留旧入口绕过新权限。
- 实施边界：不增建后端，不新增业务系统，不扩大公开数据；源代码维护与发布副本明确区分。

## 审阅与执行方式

推荐 **本会话连续实施，完成后独立复核（Native）**：这轮修改共享人员权限、任务记录和单页构建顺序，连续实施能减少接口交接成本。另一选择是逐任务由独立实施者和独立审查者推进（Subagent-driven），检查更频繁、耗时与上下文成本更高。

请确认本计划覆盖所需范围并选择方式后开始产品代码修改。已批准的业务规则不再重复询问；未列出的真实配置先采用可编辑演示值。
