function installOA(C){
const old={seed:C.seed,upgrade:C.upgrade,validate:C.validate,change:C.change};
const assert=(v,m)=>{if(!v)throw Error(m)}, text=v=>typeof v==='string'&&v.trim().length>0&&v.length<=10000;
const sets=['requests','meetings','reports','collabs','notices'];
const member=(d,id)=>d.members.find(m=>m.id===id);
const canProject=(d,u,p)=>u.role==='ceo'||C.manageable(d,u,p)||member(d,u.person)?.projects.includes(p)||C.tasksOf(d,p).some(t=>t.owner===u.person);
function upgrade(data){const d=old.upgrade(data);if(d.oaVersion===1)return d;assert(!d.oaVersion,'OA版本不兼容');d.oa={requests:[],meetings:[],reports:[],collabs:[],notices:[]};d.oaVersion=1;
const project=d.projects.find(p=>p.id==='kcg'),lin=member(d,'lin'),chen=member(d,'chen');
if(project&&lin&&chen&&member(d,'ceo')){
const base={project:'kcg',created:'2026-10-09 09:00:00',due:'2026-10-15',events:[]};
d.oa.requests.push({...base,id:C.uid(),title:'演示 · 10店试点推广资源申请',body:'申请门店陈列与营销策划资源；先由项目负责人核对，再由 CEO 决策。',author:'chen',category:'资源',amount:0,currency:'USD',approvers:['lin','ceo'],step:0,status:'pending'});
d.oa.meetings.push({...base,id:C.uid(),title:'演示 · KCG 试点推进周会',body:'检查备货、门店签约、首单履约及回款障碍。',author:'lin',time:'10:00',attendees:['lin','chen'],minutes:[],tasks:[],status:'scheduled'});
d.oa.collabs.push({...base,id:C.uid(),title:'演示 · 补充采购方案评估',body:'请采购运营比较交期、价格与风险，形成备选方案。',author:'lin',owner:'chen',status:'pending'});
d.oa.notices.push({...base,id:C.uid(),title:'演示 · 经营周报提交规范',body:'每周汇报成果、障碍、下一步行动，并引用项目进度；待决策事项应单独提交审批。',author:'lin',category:'制度',audience:['lin','chen'],version:1,reads:[],versions:[],status:'published'});
}return d}
function validate(d){old.validate(d);if(d.oaVersion===undefined)return true;assert(d.oaVersion===1&&d.oa,'OA格式或版本不兼容');
const ids=new Set([...d.projects,...d.stages,...d.milestones,...d.tasks,...d.approvals].map(x=>x.id));
const person=id=>!!member(d,id),people=a=>Array.isArray(a)&&a.length>0&&a.length<=d.members.length&&new Set(a).size===a.length&&a.every(person);
const log=e=>Array.isArray(e)&&e.length<20000&&e.every(x=>person(x.person)&&text(x.time)&&text(x.note));
for(const k of sets){assert(Array.isArray(d.oa[k])&&d.oa[k].length<20000,'OA集合无效');for(const r of d.oa[k]){
assert(r&&typeof r.id==='string'&&/^[a-zA-Z0-9-]+$/.test(r.id)&&!ids.has(r.id),'OA编号无效或重复');ids.add(r.id);
assert(text(r.title)&&text(r.body)&&text(r.created)&&person(r.author)&&(r.project===''||d.projects.some(p=>p.id===r.project))&&C.dateOK(r.due)&&log(r.events),'OA归属、文本、日期或记录无效');
if(k==='requests')assert(['通用','资源','采购','费用'].includes(r.category)&&Number.isFinite(r.amount)&&r.amount>=0&&r.amount<=1e12&&['USD','CNY'].includes(r.currency)&&people(r.approvers)&&r.approvers.every(id=>id!==r.author&&(['ceo','manager'].includes(member(d,id).level)||r.financeOffice&&C.canFinance?.(d,{person:id,role:member(d,id).level})))&&Number.isInteger(r.step)&&r.step>=0&&r.step<r.approvers.length&&['pending','approved','rejected','withdrawn'].includes(r.status),'申请或审批链无效');
if(k==='meetings')assert(/^([01]\d|2[0-3]):[0-5]\d$/.test(r.time)&&people(r.attendees)&&log(r.minutes)&&(r.agenda===undefined||log(r.agenda))&&Array.isArray(r.tasks)&&new Set(r.tasks).size===r.tasks.length&&r.tasks.every(id=>d.tasks.some(t=>t.id===id&&C.projectOf(d,t).id===r.project))&&['scheduled','completed'].includes(r.status),'会议资料无效');
if(k==='reports')assert(['日报','周报','月报'].includes(r.period)&&person(r.reviewer)&&['ceo','manager'].includes(member(d,r.reviewer).level)&&log(r.comments)&&typeof r.blockers==='string'&&r.blockers.length<=10000&&text(r.next)&&['submitted','reviewed'].includes(r.status)&&Array.isArray(r.snapshot)&&r.snapshot.every(s=>text(s.name)&&typeof s.id==='string'&&Number.isInteger(s.progress)&&s.progress>=0&&s.progress<=100),'汇报资料无效');
if(k==='reports'&&r.krSnapshot!==undefined)assert(Array.isArray(r.krSnapshot)&&r.krSnapshot.every(x=>text(x.name)&&typeof x.id==='string'&&(x.rate===null||Number.isFinite(x.rate)&&x.rate>=0&&x.rate<=100)),'KR快照无效');
if(k==='collabs')assert(person(r.owner)&&r.owner!==r.author&&['pending','accepted','review','done'].includes(r.status)&&(!r.escalation||d.oa.requests.some(a=>a.id===r.escalation&&a.project===r.project)),'协作资料无效');
if(k==='notices')assert(['公告','制度'].includes(r.category)&&people(r.audience)&&Number.isInteger(r.version)&&r.version>=1&&r.status==='published'&&Array.isArray(r.reads)&&new Set(r.reads.map(x=>x.person)).size===r.reads.length&&r.reads.every(x=>r.audience.includes(x.person)&&x.version===r.version&&text(x.time))&&Array.isArray(r.versions)&&r.versions.every(x=>text(x.title)&&text(x.body)&&Number.isInteger(x.version)),'公告资料无效');
}}return true}
function change(data,u,cmd){if(cmd.type!=='oa'){const next=C.clone(data);const result=old.change(next,u,cmd);validate(next);Object.keys(data).forEach(k=>delete data[k]);Object.assign(data,next);return result}const d=C.clone(data);upgrade(d);validate(d);
assert(member(d,u.person)?.level===u.role,'身份无效');const v=cmd.values||{},time=new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'});
const manager=()=>assert(['ceo','manager'].includes(u.role),'仅管理负责人或 CEO 可操作');
const get=k=>{const r=d.oa[k].find(x=>x.id===cmd.id);assert(r,'记录不存在');return r};
const owner=r=>assert(r.author===u.person||u.role==='ceo','仅发起人或 CEO 可操作');
const scoped=p=>assert(p===''||d.projects.some(x=>x.id===p)&&canProject(d,u,p),'请关联本人参与或负责的项目');
const add=(k,extra)=>{scoped(v.project);assert(text(v.title)&&text(v.body)&&C.dateOK(v.due),'请填写标题、内容和有效日期');const r={id:C.uid(),title:v.title.trim(),body:v.body.trim(),project:v.project,due:v.due,author:u.person,created:time,events:[],...extra};d.oa[k].unshift(r);return r};
const note=()=>{assert(text(v.note),'请填写处理意见或反馈');return v.note.trim()};
const event=(r,n)=>r.events.push({person:u.person,time,note:n});
let r,before=null,result;
if(cmd.op==='request'){
if(cmd.id){r=get('requests');before=C.clone(r);assert(r.author===u.person&&['rejected','withdrawn'].includes(r.status),'仅发起人可修改被退回或撤回的申请');scoped(v.project);Object.assign(r,{title:v.title,body:v.body,project:v.project,due:v.due})}else r=add('requests',{});
Object.assign(r,{category:v.category,amount:Number(v.amount),currency:v.currency,approvers:C.clone(v.approvers),step:0,status:'pending'});event(r,cmd.id?'修改后重新提交审批':'提交申请');
}else if(cmd.op==='decide'){
r=get('requests');before=C.clone(r);assert(r.status==='pending'&&r.approvers[r.step]===u.person,'仅当前审批人可处理此申请');assert(typeof v.approve==='boolean','请选择审批结果');event(r,(v.approve?'通过：':'退回：')+note());if(!v.approve)r.status='rejected';else if(r.step===r.approvers.length-1)r.status='approved';else r.step++;
}else if(cmd.op==='withdraw'){
r=get('requests');before=C.clone(r);assert(r.author===u.person&&r.status==='pending','仅发起人可撤回待审批申请');r.status='withdrawn';event(r,'撤回：'+note());
}else if(cmd.op==='meeting'){
manager();r=add('meetings',{time:v.time,attendees:C.clone(v.attendees),minutes:[],tasks:[],status:'scheduled'});event(r,'安排会议');
}else if(cmd.op==='agenda'){
r=get('meetings');before=C.clone(r);assert(r.status==='scheduled'&&(r.attendees.includes(u.person)||r.author===u.person||u.role==='ceo'),'仅会前的参会人、组织者或 CEO 可补充议题');r.agenda=r.agenda||[];r.agenda.push({person:u.person,time,note:note()});event(r,'补充会前议题');
}else if(cmd.op==='minutes'){
r=get('meetings');before=C.clone(r);owner(r);r.minutes.push({person:u.person,time,note:note()});r.status='completed';event(r,'记录会议纪要');
}else if(cmd.op==='action'){
r=get('meetings');before=C.clone(r);manager();owner(r);assert(r.minutes.length,'先记录会议纪要，再生成行动');assert(text(v.title)&&text(v.body)&&text(v.criteria)&&C.dateOK(v.due),'请填写行动、交付物、验收标准及日期');
const m=d.milestones.find(x=>x.id===v.milestone),s=d.stages.find(x=>x.id===m?.stage);assert(s?.project===r.project,'行动必须关联会议所属项目的 KR');assert(member(d,v.owner),'请选择责任人');
const t={id:C.uid(),name:v.title,milestone:m.id,parent:'',owner:v.owner,roleName:member(d,v.owner).role,start:r.due,end:v.due,delivery:v.body,criteria:v.criteria,deps:[],priority:'P1',progress:0,status:'active',obstacle:'',order:d.tasks.length+1,updates:[]};
assert(t.start<=t.end,'截止日期不能早于会议日期');d.tasks.push(t);r.tasks.push(t.id);event(r,'生成项目行动：'+t.name);result=t;
}else if(cmd.op==='report'){
const snapshot=C.tasksOf(d,v.project).filter(t=>u.role==='ceo'||C.manageable(d,u,v.project)||t.owner===u.person).map(t=>({id:t.id,name:t.name,progress:t.progress,status:t.status}));
const krSnapshot=d.milestones.filter(m=>d.stages.some(s=>s.id===m.stage&&s.project===v.project)).map(m=>({id:m.id,name:m.name,rate:C.krRate(m),metric:m.metric?C.clone(m.metric):null}));
r=add('reports',{period:v.period,blockers:v.blockers||'',next:v.next,reviewer:v.reviewer,comments:[],snapshot,krSnapshot,status:'submitted'});event(r,'提交工作汇报');
}else if(cmd.op==='comment'){
r=get('reports');before=C.clone(r);assert(r.reviewer===u.person||u.role==='ceo','仅指定点评人或 CEO 可点评');r.comments.push({person:u.person,time,note:note()});r.status='reviewed';event(r,'点评汇报');
}else if(cmd.op==='collab'){
r=add('collabs',{owner:v.owner,status:'pending'});event(r,'发起跨部门协作');
}else if(cmd.op==='collab-state'){
r=get('collabs');before=C.clone(r);const allowed=(r.status==='pending'&&v.state==='accepted'&&r.owner===u.person)||(r.status==='accepted'&&v.state==='review'&&r.owner===u.person)||(r.status==='review'&&['done','accepted'].includes(v.state)&&r.author===u.person);assert(allowed,'请按接单、反馈、发起人确认的顺序操作');r.status=v.state;event(r,({accepted:'接单 / 退回完善',review:'反馈结果',done:'确认完成'}[v.state])+'：'+note());
}else if(cmd.op==='escalate'){
r=get('collabs');before=C.clone(r);assert(u.role!=='ceo'&&(r.author===u.person||r.owner===u.person)&&r.status!=='done','仅未完成协作的发起人或接收人可升级 CEO');assert(!d.oa.requests.some(a=>a.id===r.escalation&&a.status==='pending'),'已有待处理的升级申请');
const a={id:C.uid(),title:'协作升级 · '+r.title,body:note(),project:r.project,due:r.due,author:u.person,created:time,events:[{person:u.person,time,note:'由跨部门协作升级'}],category:'资源',amount:0,currency:'USD',approvers:['ceo'],step:0,status:'pending'};d.oa.requests.unshift(a);r.escalation=a.id;event(r,'升级 CEO：'+v.note);
}else if(cmd.op==='notice'){
manager();if(cmd.id){r=get('notices');before=C.clone(r);owner(r);scoped(v.project);r.versions.push({version:r.version,title:r.title,body:r.body,time});Object.assign(r,{title:v.title,body:v.body,project:v.project,due:v.due});r.version++;r.reads=[]}else r=add('notices',{version:1,reads:[],versions:[],status:'published'});
Object.assign(r,{category:v.category,audience:C.clone(v.audience)});event(r,cmd.id?'更新版本，重新确认阅读':'发布公告 / 制度');
}else if(cmd.op==='ack'){
r=get('notices');before=C.clone(r);assert(r.audience.includes(u.person),'不在指定阅读范围');assert(!r.reads.some(x=>x.person===u.person),'本版本已确认阅读');r.reads.push({person:u.person,time,version:r.version});event(r,'确认阅读 v'+r.version);
}else if(cmd.op==='remind'){
assert(['requests','collabs'].includes(v.kind),'不支持此类催办');r=get(v.kind);before=C.clone(r);owner(r);assert(v.kind==='requests'?r.status==='pending':['pending','accepted','review'].includes(r.status),'事项已关闭');event(r,'站内催办：'+note());
}else throw Error('未知 OA 操作');
d.history.unshift({id:C.uid(),time,actor:u.role+' / '+member(d,u.person).name,action:'oa',target:r.title,reason:r.events.at(-1)?.note||'',before,after:C.clone(r)});validate(d);Object.keys(data).forEach(k=>delete data[k]);Object.assign(data,d);return C.clone(result||r);
}
const visible=(d,u,k,r)=>u.role==='ceo'||r.author===u.person||(k==='requests'?r.approvers.includes(u.person)||d.oa.collabs.some(c=>c.escalation===r.id&&(c.owner===u.person||c.author===u.person)):k==='meetings'?r.attendees.includes(u.person):k==='reports'?r.reviewer===u.person:k==='collabs'?r.owner===u.person:r.audience.includes(u.person));
Object.assign(C,{seed:()=>upgrade(old.seed()),upgrade,validate,change,oaVisible:visible,oaCanProject:canProject});
}
installOA(Core);
