import {startPreview} from './browser-preview.mjs';
const preview=await startPreview();
import {navigate} from './browser-navigation.mjs';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/53671/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{
const p=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
const action=async(op,id)=>p.locator(`[data-action="admin"][data-op="${op}"]${id?`[data-id="${id}"]`:''}`).first().click();
const role=async(r,id)=>{await p.locator('#role').selectOption(r);if(id)await p.locator('#person').selectOption(id)};
const fill=async(v)=>{for(const[k,x]of Object.entries(v))await p.locator(`#modal [name="${k}"]`).fill(x)};
const save=async()=>{await p.locator('#saveBtn').click();assert.equal(await p.locator('#formError').innerText(),'');assert.ok(!await p.locator('#modal').evaluate(e=>e.open))};
const data=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('gaoyue-ceo-workbench-v1')).data);
await p.goto(preview.url);await navigate(p,'oa');assert.equal(await p.locator('.admin-tool').count(),7);
await role('operator','chen');await action('personnel-new','请假');await fill({reason:'测试安排',attachmentNames:'请假说明.pdf',attachmentNote:'仅展示'});await save();let r=(await data()).admin.personnel[0];
await role('manager','lin');await navigate(p,'approvals');await action('personnel-detail',r.id);await action('personnel-decide');await fill({note:'同意安排'});await save();
await role('manager','gu');await navigate(p,'hr');await action('personnel-detail',r.id);assert.equal(await p.locator('#modal .attachment-item').count(),1);await action('personnel-complete');await fill({note:'登记完成'});await save();assert.equal((await data()).admin.personnel[0].status,'completed');
await navigate(p,'oa');await action('tab','assets');await action('asset-edit');await fill({code:'PC-001',name:'演示笔记本',location:'办公室',value:'1000'});await save();
await role('operator','chen');await action('asset-request','借用');await fill({reason:'项目方案评估'});await save();r=(await data()).admin.assetRequests[0];await role('manager','gu');await action('asset-request-detail',r.id);await action('asset-decide');await fill({note:'核对设备后交付'});await save();assert.equal((await data()).admin.assets[0].holder,'chen');
await action('tab','collaboration');await p.locator('[data-action="oa-tab"][data-id="requests"]').click();await p.locator('[data-action="oa-open"][data-kind="requests"][data-id=""]').click();await fill({title:'演示方案',body:'方案说明',attachmentNames:'试点方案.pdf'});await save();r=(await data()).oa.requests.find(r=>r.title==='演示方案');await p.locator(`[data-action="oa-open"][data-id="${r.id}"]`).click();await action('discuss');await fill({text:'补充方案说明'});await save();await p.locator(`[data-action="oa-open"][data-id="${r.id}"]`).click();assert.equal(await p.locator('.discussion-entry').count(),1);await action('discuss');await fill({text:'回复说明'});await save();
await p.reload();assert.equal((await data()).oa.requests.find(x=>x.id===r.id).discussion.length,2);await navigate(p,'oa');await p.screenshot({path:new URL('preview-administration.png',import.meta.url).pathname.slice(1),fullPage:true});
await p.setViewportSize({width:390,height:844});for(const tab of ['tools','personnel','assets','access','collaboration']){await action('tab',tab);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),tab)}
assert.deepEqual(errors,[]);console.log('PASS administrative browser: HR approval/processing, mock attachment, asset loan, comments, persistence, five responsive tabs');
}finally{await browser.close();await preview.close()}
