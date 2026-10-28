import {readFile,writeFile} from 'node:fs/promises';
const read=n=>readFile(new URL(n,import.meta.url),'utf8');
let html=await read('index.html');
const core=await read('oa-core.js'),ui=(await read('oa-ui.js')).replace("${button('进入办公中心 ↗','module','oa','','primary')}","${view==='oa'?'':button('进入办公中心 ↗','module','oa','','primary')}").replace('任务进度快照；后续任务变化不会改写本期快照','任务进度与 OKR 快照；后续变化不会改写本期快照'),css=await read('oa.css');
function replace(a,b){if(!html.includes(a))throw Error('Missing insertion point '+a.slice(0,100));html=html.replace(a,b)}
if(!html.includes('/* OA CORE START */')){
 replace('function boot(){','/* OA CORE START */\n'+core+'\n/* OA CORE END */\nfunction boot(){');
 replace('function title(kicker,','/* OA UI START */\n'+ui+'\n/* OA UI END */\nfunction title(kicker,');
 replace('</style>','/* OA CSS START */\n'+css+'\n/* OA CSS END */\n</style>');
 replace('const names={overview:', 'const names={oa:"OA 办公管理",overview:');
 replace('const symbols={overview:', 'const symbols={oa:"▦",overview:');
 replace('const renderer={hr:', 'const renderer={oa:oaView,hr:');
 replace('parsed.data.managementVersion!==3','parsed.data.managementVersion!==3||parsed.data.oaVersion!==1');
 replace('const pending=data.approvals.filter(a=>a.status==="pending").length,risks=', 'const pending=data.approvals.filter(a=>a.status==="pending").length+oaPending(),risks=');
 replace('$("content").innerHTML=renderer[view]();','$("content").innerHTML=renderer[view]();\nif(view==="approvals")$("content").innerHTML+=oaApprovals();\nif(view==="risks")$("content").innerHTML+=oaRisks();');
 replace('+supportCards()+memberCards()+','+supportCards()+oaExecutive()+memberCards()+');
 replace('const pending=data.approvals.filter(a=>a.status==="pending"),issues=', 'const pending=[...data.approvals.filter(a=>a.status==="pending"),...oaRows("requests").filter(r=>r.status==="pending")],issues=');
 replace('if(a==="go-path")','if(a==="oa-tab"){oaTab=id;oaSearch="";view="oa";render()}\nelse if(a==="oa-open"){if(id)oaDetail(b.dataset.kind,id);else oaEdit(b.dataset.kind)}\nelse if(a==="oa-command")oaCommand(b.dataset.kind,id,b.dataset.op);\nelse if(a==="go-path")');
 replace('if(e.target.id==="role")','if(e.target.id==="oaSearch"){oaSearch=e.target.value.trim();render()}\nelse if(e.target.id==="role")');
 replace('const labels={kr:', 'const labels={oa:"OA 办公记录",kr:');
}else{
 html=html.replace(/\/\* OA CORE START \*\/[\s\S]*?\/\* OA CORE END \*\//,()=> '/* OA CORE START */\n'+core+'\n/* OA CORE END */');
 html=html.replace(/\/\* OA UI START \*\/[\s\S]*?\/\* OA UI END \*\//,()=> '/* OA UI START */\n'+ui+'\n/* OA UI END */');
 html=html.replace(/\/\* OA CSS START \*\/[\s\S]*?\/\* OA CSS END \*\//,()=> '/* OA CSS START */\n'+css+'\n/* OA CSS END */');
}
html=html.replace('const names={oa:"OA 办公管理",overview:"CEO 总览",','const names={overview:"CEO 总览",oa:"OA 办公管理",');
html=html.replace('const labels={kr:', 'const labels={oa:"OA 办公记录",kr:');
if(!html.includes('7.</b> OA办公'))html=html.replace('<p><b>6.</b> 复盘生成新的改进行动；成员、财务、KR及行动变更均保留记录。</p>','<p><b>6.</b> 复盘生成新的改进行动；成员、财务、KR及行动变更均保留记录。</p><p><b>7.</b> OA办公包含个人待办、申请审批、会议决议、工作汇报、跨部门协作、公告制度。申请支持一至两级审批；会议决议可生成项目任务；汇报保留任务和KR快照；协作可升级CEO；公告更新版本后须重新确认阅读。所有处理均保留历史。</p>');
for(const [tag,file,anchor]of [['PROJECT DELETE CORE','project-delete-core.js','function boot(){'],['PROJECT DELETE UI','project-delete-ui.js','function title(kicker,'],['ADMIN CORE','admin-core.js','function boot(){'],['ADMIN UI','admin-ui.js','function title(kicker,'],['ADMIN CSS','admin.css','</style>']]){
 const block='/* '+tag+' START */\n'+await read(file)+'\n/* '+tag+' END */\n';
 if(html.includes('/* '+tag+' START */'))html=html.replace(new RegExp('/\\* '+tag+' START \\*/[\\s\\S]*?/\\* '+tag+' END \\*/\\n?'),()=>block);else replace(anchor,block+anchor);
}
html=html.replace('oa:"OA 办公管理"','oa:"行政事务工具清单"').replace('oa:oaView','oa:administrationView');
html=html.replace('parsed.data.oaVersion!==1;','parsed.data.oaVersion!==1||parsed.data.adminVersion!==1;');
if(!html.includes('else if(a==="admin")'))html=html.replace('else if(a==="oa-command")','else if(a==="admin")adminCommand(b.dataset.op,id,b);\nelse if(a==="oa-command")');
html=html.replace('if(a==="oa-tab"){oaTab=id;', 'if(a==="oa-tab"){adminTab="collaboration";oaTab=id;');
html=html.replace('view=nav.dataset.view;moduleProject="";', 'view=nav.dataset.view;if(view==="oa")adminTab="tools";moduleProject="";');
html=html.replace('oaPending(),risks=', 'oaPending()+adminPending(),risks=');
if(!html.includes('innerHTML+=adminApprovals()'))html=html.replace('if(view==="approvals")$("content").innerHTML+=oaApprovals();','if(view==="approvals"){$("content").innerHTML+=oaApprovals();$("content").innerHTML+=adminApprovals();}');
html=html.replace('+supportCards()+oaExecutive()+memberCards()+','+supportCards()+adminSummary()+oaExecutive()+memberCards()+');
const hrStart=html.indexOf('function hrView(){'),hrEnd=html.indexOf('function financeView()',hrStart);let hr=html.slice(hrStart,hrEnd);if(!hr.includes('personnelPanel(true)')){hr=hr.replace('`${moduleProject?', 'personnelPanel(true)+`${moduleProject?');html=html.slice(0,hrStart)+hr+html.slice(hrEnd)}
html=html.replaceAll('data.members.filter(m=>m.level===user.role)','data.members.filter(m=>m.level===user.role&&m.employment!=="离职")').replaceAll('data.members.find(m=>m.level===user.role)','data.members.find(m=>m.level===user.role&&m.employment!=="离职")');
html=html.replace('const labels={"delete-project":','const labels={admin:"行政事务", "delete-project":');
for(const [tag,file,anchor]of [['MEMBER CORE','member-core.js','function boot(){'],['MEMBER UI','member-ui.js','function title(kicker,'],['MEMBER CSS','member.css','</style>']]){
 const block='/* '+tag+' START */\n'+await read(file)+'\n/* '+tag+' END */\n';
 if(html.includes('/* '+tag+' START */'))html=html.replace(new RegExp('/\\* '+tag+' START \\*/[\\s\\S]*?/\\* '+tag+' END \\*/\\n?'),()=>block);else replace(anchor,block+anchor);
}
html=html.replace('overview:"CEO 总览",oa:', 'overview:"CEO 总览",member:"成员工作台",oa:').replace('const symbols={oa:', 'const symbols={member:"⌂",oa:').replace('const renderer={oa:', 'const renderer={member:memberWorkspaceView,oa:');
html=html.replace('parsed.data.adminVersion!==1;', 'parsed.data.adminVersion!==1||parsed.data.memberVersion!==1;');
if(!html.includes('else if(a==="member-workspace")'))html=html.replace('else if(a==="admin")', 'else if(a==="member-workspace")memberCommand(b.dataset.op,id);\nelse if(a==="admin")');
if(!html.includes('document.body?.classList?.toggle'))html=html.replace('function render(){','function render(){\ndocument.body?.classList?.toggle?.("member-page",view==="member");');
if(!html.includes('C.memberVisible(data,user,m.id)?memberLink'))html=html.replace('${button("查看责任与进展","member-detail",m.id,"","link")}','${button("查看责任与进展","member-detail",m.id,"","link")} ${C.memberVisible(data,user,m.id)?memberLink("打开成员工作台 ↗","open",m.id,"","link"):""}');
if(!html.includes('e.target.id==="workspacePerson"'))html=html.replace('if(e.target.id==="oaSearch")','if(e.target.id==="workspacePerson"){workspaceMember=e.target.value;render()}\nelse if(e.target.id==="workspaceCompleted"){workspaceCompleted=e.target.checked;render()}\nelse if(e.target.id==="oaSearch")');
html=html.replace('filterOwner="";render()}','filterOwner="";workspaceMember=user.person;render()}').replace('user.person=e.target.value;render()}','user.person=e.target.value;workspaceMember=user.person;render()}');
html=html.replace('const labels={admin:', 'const labels={"member-workspace":"成员工作台",admin:');
html=html.replaceAll('<h2>OA 办公管理</h2>','<h2>协作与审批</h2>');
html=html.replace('if(a==="open-project"){selected=id;', 'if(a==="open-project"){$("modal").close();selected=id;');
html=html.replace('统计不包含出勤时长、设备使用或在线时间。考勤与考核按登记记录展示。','统计依据已登记的项目、人事和个人待办记录；考勤与考核按登记内容展示。');
html=html.replace('<b>7.</b> OA办公包含','<b>7.</b> 行政事务工具清单内的协作与审批包含');
if(!html.includes('<b>8.</b> 行政事务'))html=html.replace('所有处理均保留历史。</p><div class="criteria">','所有处理均保留历史。</p><p><b>8.</b> 行政事务提供七类人事申请、资产台账与行政职位权限；方案附件只展示名称和说明，详情支持评论回复。</p><p><b>9.</b> 成员工作台提供档案、合同、考勤、考核、岗位、业务统计与日历待办。个人待办仅本人维护，档案登记按行政及管理权限处理。</p><div class="criteria">');
await writeFile(new URL('index.html',import.meta.url),html);
const script=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
await writeFile(new URL('core.js',import.meta.url),script.slice(0,script.indexOf('function boot()')));
console.log('OA embedded in standalone index.html');
