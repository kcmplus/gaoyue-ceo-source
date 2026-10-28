import {readFile,writeFile} from 'node:fs/promises';
const read=n=>readFile(new URL(n,import.meta.url),'utf8');let h=await read('index.html');
for(const[tag,file,anchor]of [['GOVERNANCE CORE','governance-core.js','function boot(){'],['GOVERNANCE UI','governance-ui.js','function title(kicker,'],['GOVERNANCE CSS','governance.css','</style>']]){let body;try{body=await read(file)}catch(e){if(file==='governance-core.js')throw e;continue}const b='/* '+tag+' START */\n'+body+'\n/* '+tag+' END */\n';if(h.includes('/* '+tag+' START */'))h=h.replace(new RegExp('/\\* '+tag+' START \\*/[\\s\\S]*?/\\* '+tag+' END \\*/\\n?'),()=>b);else h=h.replace(anchor,b+anchor)}
h=h.replace('parsed.data.memberVersion!==1;','parsed.data.memberVersion!==1||parsed.data.governanceVersion!==1;');
if(h.includes('/* GOVERNANCE UI START */')){
h=h.replace('member:"成员工作台",oa:', 'member:"成员工作台",inbox:"统一待办",archives:"项目档案",oa:').replace('const symbols={member:', 'const symbols={inbox:"☷",archives:"▱",member:').replace('const renderer={member:', 'const renderer={inbox:inboxView,archives:archiveView,member:');
if(!h.includes('if(a==="governance")'))h=h.replace('if(a==="oa-tab")','if(a==="governance")governanceCommand(b.dataset.op,id,b);\nelse if(a==="oa-tab")');
if(!h.includes('installGovernanceUI();'))h=h.replace('\nrender();\n}\nboot();','\ninstallGovernanceUI();\nrender();\n}\nboot();');
h=h.replaceAll("${button('删除项目','delete-project',p.id,'','delete-project-button')}","${gLink('项目状态','lifecycle',p.id)}");
h=h.replace("?button('删除项目','delete-project',p.id,'','delete-project-button')", "?gLink('项目状态','lifecycle',p.id)");
h=h.replace('button("删除项目","delete-project",p.id,"","delete-project-button")','gLink("项目状态 / 归档","lifecycle",p.id)');
h=h.replace("['待办行动',ts.filter(t=>t.status!=='done').length,'tasks']", "['待我执行',C.inbox(data,{person:m.id,role:m.level},asOf).filter(r=>r.category==='execute').length,'tasks']");
h=h.replaceAll('date:t.due','date:t.end').replaceAll('esc(t.due)','esc(t.end)');
h=h.replace("events.filter(t=>t.date===workspaceDate&&(workspaceCompleted||!t.done))", "events.filter(t=>t.date<=workspaceDate&&(t.end||t.date)>=workspaceDate&&(workspaceCompleted||!t.done))");
h=h.replace("events.some(t=>t.date===date)","events.some(t=>t.date<=date&&(t.end||t.date)>=date)");
h=h.replace('data.members.filter(m=>m.level!=="ceo").map(m=>{const s=memberSummary(m);','data.members.filter(m=>m.level!=="ceo"&&C.memberVisible(data,user,m.id)).map(m=>{const s=memberSummary(m);');
const a=h.indexOf('function hrView(){'),b=h.indexOf('function financeView()',a);h=h.slice(0,a)+h.slice(a,b).replace('data.members.map(m=>','data.members.filter(m=>C.memberVisible(data,user,m.id)).map(m=>')+h.slice(b);
h=h.replace('esc(a.name+"（"+state(a)+"）")','esc(a?a.name+"（"+state(a)+"）":"其他授权范围的前置行动")');
for(const name of ['financeEdit','staffEdit']){const start=h.indexOf('function '+name+'(');if(start>=0){const end=h.indexOf('\nfunction ',start+10);h=h.slice(0,start)+h.slice(start,end).replaceAll('businessProjects()','businessProjectOptions()')+h.slice(end)}}
for(const name of ['memberEdit','personnelEdit','assetRequestEdit']){const start=h.indexOf('function '+name+'(');if(start>=0){const end=h.indexOf('\nfunction ',start+10);let body=h.slice(start,end).replaceAll('data.projects','projectOptions()');if(name==='personnelEdit')body=body.replaceAll('data.tasks.filter','handoverTasks().filter');h=h.slice(0,start)+body+h.slice(end)}}
h=h.replace('data=C.clone(incoming.data);asOf=', 'data=C.preservePrivate(data,C.clone(incoming.data),user);asOf=');
h=h.replace('data=C.preservePrivate(data,C.clone(incoming.data),user);asOf=C.dateOK(incoming.asOf)?incoming.asOf:asOf;storageLocked=false;save();','replaceStored(C.preservePrivate(data,C.clone(incoming.data),user),C.dateOK(incoming.asOf)?incoming.asOf:asOf);');
h=h.replace('data=C.seed();asOf="2026-10-09";storageLocked=false;save();','replaceStored(C.seed(),"2026-10-09");');
h=h.replace('asOf=e.target.value;save();render()','replaceStored(data,e.target.value);render()');
h=h.replace('本地保存失败，当前修改仅在本次页面中，请立即导出备份。','本地保存失败，本次操作未保存。请检查浏览器存储空间后重试。');
h=h.replace('view=nav.dataset.view;if(view==="oa")','view=nav.dataset.view;if(view==="inbox"){inboxSubject=user.person;inboxFilter="all"}if(view==="oa")');
h=h.replace('const pending=data.approvals.filter(a=>a.status==="pending").length+oaPending()+adminPending(),risks=', 'const pending=C.inbox(data,user,asOf).filter(r=>r.category==="approve"||r.category==="accept").length,risks=');
if(!h.includes('gLink("查看决策依据"'))h=h.replace('${button("审核并填写意见","decide",a.id,"","primary")}', '${button("审核并填写意见","decide",a.id,"","primary")}${gLink("查看决策依据","decision-detail",a.id)}');
// Each claim can be opened without granting decision authority.
h=h.replace('<p>${esc(a.detail)}</p>${a.kind', '<p>${esc(a.detail)}</p><p class="muted">最晚决策：${esc(a.due||"未单独设置")} · 建议：${esc(a.recommendation||"见背景说明")}</p>${gLink("查看完整方案","decision-detail",a.id)}${a.kind');
}
await writeFile(new URL('index.html',import.meta.url),h);const s=h.slice(h.indexOf('<script>')+8,h.lastIndexOf('</script>'));await writeFile(new URL('core.js',import.meta.url),s.slice(0,s.indexOf('function boot()')));console.log('Governance embedded');
