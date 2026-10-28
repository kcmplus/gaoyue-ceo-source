import {startPreview} from './browser-preview.mjs';
const preview=await startPreview();
import {navigate} from './browser-navigation.mjs';
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/53671/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const checks=[],errors=[];
try{
const ctx=await browser.newContext({viewport:{width:1500,height:1000}}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
await p.goto(preview.url);await navigate(p,'path');assert.equal(await p.locator('[data-action="delete-project"]').count(),0);await navigate(p,'archives');await p.locator('[data-op="lifecycle"][data-id="media"]').click();await p.locator('[name="state"]').selectOption('archived');await p.locator('[name="reason"]').fill('归档后测试永久删除');await p.locator('#saveBtn').click();assert.equal(await p.locator('#formError').innerText(),'');
assert.equal(await p.locator('[data-action="delete-project"]').count(),1);checks.push('日常页面提供归档，永久删除仅在已归档项目提供');
await p.locator('[data-action="delete-project"][data-id="media"]').click();await p.locator('#cancelBtn').click();assert.equal(await p.locator('[data-action="delete-project"][data-id="media"]').count(),1);checks.push('取消删除保留项目');
await p.locator('[data-action="delete-project"][data-id="media"]').click();await p.locator('[name="confirm"]').fill('内容营销增长');await p.locator('[name="backupConfirm"]').check();await p.locator('#saveBtn').click();assert.match(await p.locator('#formError').innerText(),/备份/);
const downloadPromise=p.waitForEvent('download');await p.locator('#deleteBackup').click();const downloaded=await downloadPromise;const backupText=await readFile(await downloaded.path(),'utf8'),backup=JSON.parse(backupText);assert.ok(backup.data.projects.find(x=>x.id==='media'));
await p.locator('[name="confirm"]').fill('错名字');await p.locator('#saveBtn').click();assert.match(await p.locator('#formError').innerText(),/项目名称/);checks.push('必须先下载备份并输入正确名称，误操作被拦截');
await p.locator('[name="confirm"]').fill('内容营销增长');await p.locator('#saveBtn').click();assert.equal(await p.locator('#formError').innerText(),'');assert.equal(await p.locator('#modal').evaluate(e=>e.open),false);assert.equal(await p.locator('#path-project-media').count(),0);
await p.reload();await navigate(p,'path');assert.equal(await p.locator('#path-project-media').count(),0);checks.push('确认删除后项目消失，刷新后不会重新出现');
for(const name of ['overview','tasks','approvals','timeline','risks','history','hr','finance','oa'])await navigate(p,name);checks.push('删除后总览、任务、审批、时间线及OA均正常渲染');
await p.locator('#importFile').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(backupText)});await p.getByRole('heading',{name:'导入备份',exact:true}).waitFor();await p.locator('[name="confirm"]').fill('导入');await p.locator('#saveBtn').click();assert.equal(await p.locator('#formError').innerText(),'');await navigate(p,'archives');assert.equal(await p.locator('[data-action="delete-project"][data-id="media"]').count(),1);checks.push('删除前备份可恢复为归档状态');
await p.locator('#role').selectOption('manager');assert.equal(await p.locator('[data-action="delete-project"]').count(),0);await p.locator('#role').selectOption('operator');assert.equal(await p.locator('[data-action="delete-project"]').count(),0);checks.push('负责人和运营成员均无删除入口');
await p.locator('#role').selectOption('ceo');await navigate(p,'archives');await p.setViewportSize({width:390,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks.push('新增按钮在手机宽度下无整页横向溢出');
await p.setViewportSize({width:1500,height:1000});await p.locator('#toast').evaluate(e=>e.style.display='none');await p.screenshot({path:new URL('./preview-project-delete.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')});
// A failed local save must keep the original project visible and persisted.
await p.locator('[data-action="delete-project"][data-id="media"]').click();const download2=p.waitForEvent('download');await p.locator('#deleteBackup').click();await download2;await p.locator('[name="confirm"]').fill('内容营销增长');await p.locator('[name="backupConfirm"]').check();await p.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('quota')}});await p.locator('#saveBtn').click();assert.match(await p.locator('#formError').innerText(),/删除未能保存/);assert.equal(await p.locator('[data-action="delete-project"][data-id="media"]').count(),1);checks.push('本地存储失败时撤销删除，保留原项目');
assert.deepEqual(errors,[]);checks.push('浏览器无运行错误');await writeFile(new URL('./validation-project-delete.json',import.meta.url),JSON.stringify({passed:checks.length,checks},null,2));console.log(JSON.stringify({passed:checks.length,checks},null,2));
}finally{await browser.close();await preview.close()}
