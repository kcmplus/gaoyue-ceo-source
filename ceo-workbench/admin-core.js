function installAdministration(C){
const old={seed:C.seed,upgrade:C.upgrade,validate:C.validate,change:C.change};
const assert=(x,m)=>{if(!x)throw Error(m)},text=x=>typeof x==='string'&&x.trim().length>0&&x.length<=10000;
const categories=['请假','出差','调休','入职','转岗','离职','工作交接'],permissions=['personnel','assets','access'];
const member=(d,id)=>d.members.find(m=>m.id===id),active=(d,id)=>member(d,id)&&member(d,id).employment!=='离职';
function can(d,u,permission){return active(d,u.person)&&member(d,u.person).level===u.role&&(u.role==='ceo'||d.admin?.assignments.some(a=>a.member===u.person&&a.positions.some(id=>d.admin.positions.find(p=>p.id===id)?.permissions.includes(permission))))}
function upgrade(data){const d=old.upgrade(data);if(d.adminVersion===1)return d;assert(!d.adminVersion,'行政数据版本不兼容');d.adminVersion=1;d.admin={positions:[{id:'admin-supervisor',name:'行政主管',permissions:[...permissions]},{id:'hr-specialist',name:'人事专员',permissions:['personnel']}],assignments:[],personnel:[],assets:[],assetRequests:[]};if(member(d,'gu'))d.admin.assignments.push({member:'gu',positions:['admin-supervisor']});if(member(d,'tang'))d.admin.assignments.push({member:'tang',positions:['hr-specialist']});return d}
function visible(d,u,kind,r){return can(d,u,kind==='personnel'?'personnel':'assets')||r.author===u.person||r.subject===u.person||r.approver===u.person||r.details?.receiver===u.person}
function validate(d){old.validate(d);if(d.adminVersion===undefined)return true;assert(d.adminVersion===1&&d.admin,'行政数据无效');const a=d.admin;
for(const k of ['positions','assignments','personnel','assets','assetRequests'])assert(Array.isArray(a[k])&&a[k].length<20000,'行政集合无效');
const ids=new Set();const id=x=>{assert(x&&typeof x.id==='string'&&/^[a-zA-Z0-9-]+$/.test(x.id)&&!ids.has(x.id),'行政编号重复或无效');ids.add(x.id)};
const person=x=>!!member(d,x),project=x=>x===''||d.projects.some(p=>p.id===x),log=x=>Array.isArray(x)&&x.every(e=>person(e.person)&&text(e.time)&&text(e.note));
const attachment=x=>Array.isArray(x)&&x.length<=30&&x.every(f=>text(f.id)&&text(f.name)&&f.name.length<=200&&typeof f.note==='string'&&f.note.length<=1000&&person(f.person)&&text(f.time)&&f.demo===true&&!('base64'in f));
for(const r of [...Object.values(d.oa||{}).flat(),...a.personnel,...a.assetRequests]){
 if(r.attachments!==undefined)assert(attachment(r.attachments),'演示附件资料无效');
 if(r.discussion!==undefined){assert(Array.isArray(r.discussion)&&r.discussion.length<2000,'评论资料无效');const prior=new Set();for(const c of r.discussion){assert(text(c.id)&&!prior.has(c.id)&&person(c.person)&&text(c.text)&&text(c.time)&&(!c.replyTo||prior.has(c.replyTo))&&attachment(c.attachments||[]),'评论回复引用无效');prior.add(c.id)}}
}
for(const p of a.positions){id(p);assert(text(p.name)&&Array.isArray(p.permissions)&&new Set(p.permissions).size===p.permissions.length&&p.permissions.every(x=>permissions.includes(x)),'职位权限无效')}
const assigned=new Set();for(const r of a.assignments){assert(person(r.member)&&!assigned.has(r.member)&&Array.isArray(r.positions)&&new Set(r.positions).size===r.positions.length&&r.positions.every(id=>a.positions.some(p=>p.id===id)),'人员职位分配无效');assigned.add(r.member)}
for(const r of a.personnel){id(r);assert(categories.includes(r.category)&&text(r.title)&&text(r.reason)&&person(r.author)&&person(r.approver)&&r.approver!==r.author&&project(r.project)&&C.dateOK(r.start)&&C.dateOK(r.end)&&r.start<=r.end&&Number.isFinite(r.hours)&&r.hours>=0&&['pending','approved','rejected','withdrawn','completed'].includes(r.status)&&log(r.events)&&r.details&&typeof r.details==='object','人事事务资料无效');assert(r.category==='入职'?r.subject===''||person(r.subject):person(r.subject),'申请对象无效');if(r.status==='pending')assert(active(d,r.approver)&&['ceo','manager'].includes(member(d,r.approver).level),'人事审批人须为在职管理成员');
 const v=r.details;if(['入职','转岗'].includes(r.category)){assert(text(v.role)&&['operator','manager'].includes(v.level)&&person(v.reportsTo)&&Array.isArray(v.projects)&&v.projects.every(id=>d.projects.some(p=>p.id===id)),'请完整填写目标岗位、汇报对象与项目');if(r.category==='入职')assert(text(v.name),'请填写入职姓名')}
 if(r.category==='出差')assert(text(v.destination),'请填写出差地点');
 if(r.category==='工作交接')assert(person(v.receiver)&&v.receiver!==r.subject&&text(v.items)&&Array.isArray(v.tasks)&&new Set(v.tasks).size===v.tasks.length&&v.tasks.every(id=>d.tasks.some(t=>t.id===id)),'交接接收人、内容或任务无效');
}
const codes=new Set();for(const r of a.assets){id(r);assert(text(r.code)&&!codes.has(r.code)&&text(r.name)&&text(r.category)&&text(r.location)&&Number.isFinite(r.value)&&r.value>=0&&['USD','CNY'].includes(r.currency)&&['available','issued','repair'].includes(r.status)&&(!r.holder||person(r.holder))&&['','领用','借用'].includes(r.mode)&&(!r.due||C.dateOK(r.due))&&log(r.events),'资产台账无效');assert(r.status!=='available'||!r.holder,'闲置资产不能有领用人');assert(r.status!=='issued'||r.holder,'已分配资产缺少持有人');codes.add(r.code)}
for(const r of a.assetRequests){id(r);assert(['领用','借用','归还','维修','采购'].includes(r.category)&&text(r.title)&&text(r.reason)&&person(r.author)&&project(r.project)&&C.dateOK(r.due)&&['pending','completed','rejected','withdrawn'].includes(r.status)&&log(r.events),'资产申请无效');assert(r.category==='采购'?text(r.item)&&Number.isFinite(r.amount)&&r.amount>=0&&['USD','CNY'].includes(r.currency):a.assets.some(x=>x.id===r.asset),'资产申请对象无效')}
return true}
function files(d,u,items,time){assert(Array.isArray(items||[])&&(items||[]).length<=10,'一次最多展示10个附件');return (items||[]).map(f=>{assert(f&&text(f.name)&&f.name.length<=200&&typeof(f.note||'')==='string'&&(f.note||'').length<=1000&&!f.base64,'附件仅填写名称和说明，不保存真实文件');return {id:C.uid(),name:f.name.trim(),note:f.note||'',person:u.person,time,demo:true}})}
function change(data,u,cmd){const d=C.clone(data);upgrade(d);assert(active(d,u.person)&&member(d,u.person).level===(u.role==='executor'?'operator':u.role),'当前成员身份无效或已离职');const v=cmd.values||{},time=new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'}),event=(r,n)=>r.events.push({person:u.person,time,note:n}),note=()=>{assert(text(v.note),'请填写办理说明');return v.note.trim()},requirePerm=p=>assert(can(d,u,p),'当前成员没有此行政权限');let r,before=null,result;
if(cmd.type!=='admin'){
 result=old.change(d,u,cmd);
 if(cmd.type==='oa'&&['request','meeting','report','collab','notice'].includes(cmd.op)){
  const key={request:'requests',meeting:'meetings',report:'reports',collab:'collabs',notice:'notices'}[cmd.op];const row=d.oa[key].find(x=>x.id===(cmd.id||result?.id));if(row&&v.files?.length){row.attachments=[...(row.attachments||[]),...files(d,u,v.files,time)];result=C.clone(row);d.history[0].after=C.clone(row)}
 }
 validate(d);Object.keys(data).forEach(k=>delete data[k]);Object.assign(data,d);return result;
}
const find=(key)=>{const row=d.admin[key].find(x=>x.id===cmd.id);assert(row,'记录不存在');return row};
if(cmd.op==='position'){
 requirePerm('access');r=cmd.id?find('positions'):{id:C.uid()};before=cmd.id?C.clone(r):null;Object.assign(r,{name:v.name,permissions:C.clone(v.permissions)});if(!cmd.id)d.admin.positions.push(r);
}else if(cmd.op==='grant'){
 requirePerm('access');assert(active(d,v.member),'请选择在职成员');r=d.admin.assignments.find(a=>a.member===v.member);before=r?C.clone(r):null;if(!r){r={member:v.member,positions:[]};d.admin.assignments.push(r)}r.positions=C.clone(v.positions);
}else if(cmd.op==='personnel'){
 assert(categories.includes(v.category),'请选择事务类型');const managed=can(d,u,'personnel');assert(managed||!['入职','转岗'].includes(v.category),'入职和转岗由人事行政发起');assert(managed||v.subject===u.person,'普通成员只能为本人发起申请');assert(v.subject!=='ceo'||u.role==='ceo'||['请假','出差','调休'].includes(v.category),'CEO档案由本人管理');
 if(cmd.id){r=find('personnel');assert(r.author===u.person&&['rejected','withdrawn'].includes(r.status),'仅发起人可修改已退回或撤回的申请');before=C.clone(r)}else r={id:C.uid(),author:u.person,created:time,events:[],attachments:[],discussion:[]};
 assert(active(d,v.approver)&&['ceo','manager'].includes(member(d,v.approver).level),'请选择在职管理审批人');assert(v.category==='入职'||active(d,v.subject),'请选择在职成员');
 Object.assign(r,{category:v.category,title:v.title,subject:v.category==='入职'?'':v.subject,project:v.project||'',start:v.start,end:v.end,hours:Number(v.hours||0),reason:v.reason,approver:v.approver,details:C.clone(v.details||{}),status:'pending',handoverAccepted:false});r.attachments.push(...files(d,u,v.files,time));event(r,cmd.id?'修改后重新提交':'提交人事申请');if(!cmd.id)d.admin.personnel.unshift(r);
}else if(cmd.op==='personnel-decide'){
 r=find('personnel');before=C.clone(r);assert(r.status==='pending'&&r.approver===u.person,'仅当前审批人可处理');assert(typeof v.approve==='boolean','请选择审批结果');r.status=v.approve?'approved':'rejected';event(r,(v.approve?'审批通过：':'退回修改：')+note());
}else if(cmd.op==='personnel-withdraw'){
 r=find('personnel');before=C.clone(r);assert(r.status==='pending'&&r.author===u.person,'仅发起人可撤回待审批申请');r.status='withdrawn';event(r,'撤回：'+note());
}else if(cmd.op==='handover-accept'){
 r=find('personnel');before=C.clone(r);assert(r.category==='工作交接'&&r.status==='approved'&&r.details.receiver===u.person&&!r.handoverAccepted,'仅交接接收人可确认');r.handoverAccepted=true;event(r,'确认接收交接：'+note());
}else if(cmd.op==='personnel-complete'){
 requirePerm('personnel');r=find('personnel');before=C.clone(r);assert(r.status==='approved','须先通过审批再办理');const explanation=note(),m=member(d,r.subject),z=r.details;
 if(r.category==='入职'){const newMember={id:C.uid(),name:z.name,role:z.role,level:z.level,reportsTo:z.reportsTo,projects:[...z.projects],employment:'在职'};d.members.push(newMember);r.subject=newMember.id}
 if(r.category==='转岗'){assert(m.id!=='ceo','不能通过转岗修改CEO');assert(active(d,m.id),'该成员已离职');Object.assign(m,{role:z.role,level:z.level,reportsTo:z.reportsTo,projects:[...z.projects]})}
 if(r.category==='工作交接'){assert(r.handoverAccepted,'须由接收人确认交接材料');assert(active(d,z.receiver),'接收人须在职');for(const id of z.tasks){const t=d.tasks.find(t=>t.id===id);assert(t?.owner===r.subject&&t.status==='active','选中任务已变更或待验收，请核对交接任务');t.owner=z.receiver;t.roleName=member(d,z.receiver).role;t.updates.unshift({time,person:u.person,note:'人事交接：'+explanation,progress:t.progress})}}
 if(r.category==='离职'){
  assert(m.id!=='ceo','CEO不能通过普通离职流程办理');assert(!d.projects.some(p=>p.leader===m.id)&&!d.tasks.some(t=>t.owner===m.id&&t.status!=='done'),'尚有负责项目或未完成任务，请先交接');assert(!d.admin.assets.some(a=>a.holder===m.id),'尚有持有资产，请先归还');assert(!d.members.some(x=>x.reportsTo===m.id&&x.employment!=='离职'),'尚有下属汇报关系，请先交接');assert(!d.finance.some(x=>x.owner===m.id&&x.planned>x.actual)&&!d.staffing.some(x=>x.owner===m.id&&x.needed>x.filled),'尚有财务或人才需求责任，请先交接');assert(!d.oa.requests.some(a=>a.status==='pending'&&a.approvers.slice(a.step).includes(m.id))&&!d.oa.reports.some(a=>a.status==='submitted'&&a.reviewer===m.id)&&!d.oa.collabs.some(a=>a.status!=='done'&&(a.owner===m.id||a.author===m.id)),'尚有办公事项待处理，请先交接');assert(!d.admin.personnel.some(a=>a.id!==r.id&&['pending','approved'].includes(a.status)&&(a.subject===m.id||a.approver===m.id||a.details.receiver===m.id))&&!d.admin.assetRequests.some(a=>a.author===m.id&&a.status==='pending'),'尚有行政事项待处理，请先交接');m.employment='离职';d.admin.assignments=d.admin.assignments.filter(a=>a.member!==m.id);
 }
 r.status='completed';event(r,'行政办理完成：'+explanation);
}else if(cmd.op==='asset'){
 requirePerm('assets');r=cmd.id?find('assets'):{id:C.uid(),status:'available',holder:'',mode:'',due:'',events:[]};before=cmd.id?C.clone(r):null;Object.assign(r,{code:v.code,name:v.name,category:v.category,location:v.location,value:Number(v.value),currency:v.currency});event(r,cmd.id?'更新资产台账':'登记资产');if(!cmd.id)d.admin.assets.unshift(r);
}else if(cmd.op==='asset-request'){
 const a=d.admin.assets.find(a=>a.id===v.asset);assert(['领用','借用','归还','维修','采购'].includes(v.category),'资产操作无效');if(v.category!=='采购'){assert(a,'请选择台账资产');if(['领用','借用'].includes(v.category))assert(a.status==='available','资产已被占用，不能重复分配');if(v.category==='归还')assert(a.status==='issued'&&a.holder===u.person,'仅当前持有人可申请归还');if(v.category==='维修')assert(a.status!=='repair'&&(a.holder===u.person||can(d,u,'assets')),'仅持有人或行政可申请维修')}
 r={id:C.uid(),category:v.category,asset:v.asset||'',title:v.title,reason:v.reason,project:v.project||'',author:u.person,due:v.due,item:v.item||'',amount:Number(v.amount||0),currency:v.currency||'USD',status:'pending',created:time,events:[],attachments:files(d,u,v.files,time),discussion:[]};event(r,'提交资产申请');d.admin.assetRequests.unshift(r);
}else if(cmd.op==='asset-decide'){
 requirePerm('assets');r=find('assetRequests');before=C.clone(r);assert(r.status==='pending','此申请已处理');assert(r.author!==u.person,'请由另一位资产管理员或 CEO 处理本人申请');assert(typeof v.approve==='boolean','请选择审批结果');const n=note();if(v.approve){let a=d.admin.assets.find(x=>x.id===r.asset);if(r.category==='采购'){assert(text(v.code)&&text(v.location),'请填写采购入库编号和位置');a={id:C.uid(),code:v.code,name:r.item,category:'办公设备',location:v.location,value:r.amount,currency:r.currency,status:'available',holder:'',mode:'',due:'',events:[]};d.admin.assets.push(a);r.asset=a.id}
 if(['领用','借用'].includes(r.category)){assert(a?.status==='available'&&active(d,r.author),'资产状态或申请人已变化');Object.assign(a,{status:'issued',holder:r.author,mode:r.category,due:r.category==='借用'?r.due:''})}
 if(r.category==='归还'){assert(a?.status==='issued'&&a.holder===r.author,'当前持有状态已变化');Object.assign(a,{status:'available',holder:'',mode:'',due:''})}
 if(r.category==='维修'){assert(a&&a.status!=='repair'&&(a.holder===r.author||can(d,{role:member(d,r.author).level,person:r.author},'assets')),'资产状态已变化');a.status='repair'}event(a,r.category+'办理：'+n);r.status='completed';
 }else r.status='rejected';event(r,(v.approve?'资产办理完成：':'驳回：')+n);
}else if(cmd.op==='repair-finish'){
 requirePerm('assets');r=find('assets');before=C.clone(r);assert(r.status==='repair','该资产不在维修中');r.status=r.holder?'issued':'available';event(r,'维修完成：'+note());
}else if(cmd.op==='discuss'){
 const kind=v.kind;assert(['requests','meetings','reports','collabs','notices','personnel','assetRequests'].includes(kind),'评论对象无效');r=(d.oa[kind]||d.admin[kind]).find(x=>x.id===v.record);assert(r,'评论事项不存在');assert(d.oa[kind]?C.oaVisible(d,u,kind,r):visible(d,u,kind,r),'没有此事项的评论权限');assert(text(v.text),'请填写评论内容');before=C.clone(r);r.discussion=r.discussion||[];assert(!v.replyTo||r.discussion.some(c=>c.id===v.replyTo),'回复对象不存在');result={id:C.uid(),person:u.person,time,text:v.text.trim(),replyTo:v.replyTo||'',attachments:files(d,u,v.files,time)};r.discussion.push(result);event(r,'新增评论 / 回复');
}else throw Error('未知行政操作');
d.history.unshift({id:C.uid(),time,actor:u.role+' / '+member(d,u.person).name,action:'admin',target:r.title||r.name||member(d,r.member)?.name||'行政权限',reason:cmd.op,before,after:C.clone(r)});validate(d);Object.keys(data).forEach(k=>delete data[k]);Object.assign(data,d);return C.clone(result||r);
}
C.cleanupProject=(d,id)=>{if(d.admin){for(const r of [...d.admin.personnel,...d.admin.assetRequests])if(r.project===id)r.project='';for(const r of d.admin.personnel){if(r.details.projects)r.details.projects=r.details.projects.filter(x=>x!==id);if(r.details.tasks)r.details.tasks=r.details.tasks.filter(id=>d.tasks.some(t=>t.id===id))}}};
Object.assign(C,{seed:()=>upgrade(old.seed()),upgrade,validate,change,adminCan:can,adminVisible:visible,adminCategories:categories,adminActive:active});
}
installAdministration(Core);
