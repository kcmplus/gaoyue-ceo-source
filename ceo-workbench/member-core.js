function installMemberWorkspace(C){
const old={seed:C.seed,upgrade:C.upgrade,validate:C.validate,change:C.change},assert=(v,m)=>{if(!v)throw Error(m)},text=v=>typeof v==='string'&&v.trim().length>0&&v.length<=10000;
const person=(d,id)=>d.members.find(m=>m.id===id);
const visible=(d,u,id)=>!!person(d,id)&&(u.person===id||u.role==='ceo'||C.adminCan(d,u,'personnel')||u.role==='manager'&&person(d,id).reportsTo===u.person);
const editor=(d,u,id,kind)=>u.role==='ceo'||C.adminCan(d,u,'personnel')||kind==='review'&&u.role==='manager'&&person(d,id)?.reportsTo===u.person;
function upgrade(d){d=old.upgrade(d);if(d.memberVersion===undefined){d.memberVersion=1;d.memberWorkspace={todos:[],records:[],contacts:[]}}return d}
function validate(d){old.validate(d);if(d.memberVersion===undefined)return true;assert(d.memberVersion===1&&d.memberWorkspace,'成员工作台版本无效');const w=d.memberWorkspace,ids=new Set();for(const k of ['todos','records','contacts'])assert(Array.isArray(w[k])&&w[k].length<=20000,'成员记录无效');
for(const r of [...w.todos,...w.records]){assert(r&&typeof r.id==='string'&&/^[a-zA-Z0-9-]+$/.test(r.id)&&!ids.has(r.id),'成员记录编号无效');ids.add(r.id);assert(person(d,r.member)&&text(r.title)&&typeof r.note==='string'&&r.note.length<=10000&&text(r.updated),'成员记录内容无效')}
for(const r of w.todos)assert(C.dateOK(r.date)&&typeof r.done==='boolean','个人待办日期或状态无效');
for(const r of w.records)assert(['contract','attendance','review'].includes(r.kind)&&C.dateOK(r.start)&&C.dateOK(r.end)&&r.end>=r.start&&text(r.status)&&person(d,r.author),'档案记录无效');
const seen=new Set();for(const r of w.contacts){assert(person(d,r.member)&&!seen.has(r.member)&&typeof r.phone==='string'&&r.phone.length<=40&&typeof r.email==='string'&&r.email.length<=160,'联系方式无效');seen.add(r.member)}return true}
function change(data,u,cmd){const d=C.clone(data);upgrade(d);validate(d);if(cmd.type!=='member-workspace'){const result=old.change(d,u,cmd);validate(d);Object.keys(data).forEach(k=>delete data[k]);Object.assign(data,d);return result}
assert(person(d,u.person)?.level===u.role&&C.adminActive(d,u.person),'当前身份无效');const v=cmd.values||{},w=d.memberWorkspace,time=new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'});let r,before=null;
if(cmd.op==='todo-save'||cmd.op==='todo-toggle'||cmd.op==='todo-delete'){
r=cmd.id?w.todos.find(r=>r.id===cmd.id):{id:C.uid(),member:u.person,done:false};assert(r&&r.member===u.person,'仅本人可维护个人待办');before=cmd.id?C.clone(r):null;
if(cmd.op==='todo-save'){assert(text(v.title),'请填写待办标题');Object.assign(r,{title:v.title.trim(),note:String(v.note||''),date:v.date,updated:time});if(!cmd.id)w.todos.push(r)}
if(cmd.op==='todo-toggle'){assert(cmd.id,'待办不存在');r.done=!r.done;r.updated=time}
if(cmd.op==='todo-delete'){assert(cmd.id,'待办不存在');w.todos=w.todos.filter(x=>x.id!==r.id)}
}else if(cmd.op==='contact'){
assert(v.member===u.person||C.adminCan(d,u,'personnel'),'仅本人或人事行政可维护联系方式');r=w.contacts.find(r=>r.member===v.member)||{member:v.member};before=C.clone(r);Object.assign(r,{phone:String(v.phone||'').trim(),email:String(v.email||'').trim()});if(!w.contacts.includes(r))w.contacts.push(r);
}else if(cmd.op==='record'){
r=cmd.id?w.records.find(x=>x.id===cmd.id):{id:C.uid(),member:v.member,kind:v.kind};assert(r&&editor(d,u,r.member,r.kind),'没有此档案的维护权限');assert(person(d,r.member)&&['contract','attendance','review'].includes(r.kind),'档案类型或成员无效');before=cmd.id?C.clone(r):null;Object.assign(r,{title:v.title,start:v.start,end:v.end,status:v.status,note:String(v.note||''),author:u.person,updated:time});if(!cmd.id)w.records.push(r);
}else throw Error('未知成员工作台操作');
d.history.unshift({id:C.uid(),time,actor:u.role+' / '+person(d,u.person).name,action:'member-workspace',target:r.title||person(d,r.member).name,reason:cmd.op,before,after:cmd.op==='todo-delete'?null:C.clone(r)});validate(d);Object.keys(data).forEach(k=>delete data[k]);Object.assign(data,d);return C.clone(r)}
Object.assign(C,{seed:()=>upgrade(old.seed()),upgrade,validate,change,memberVisible:visible,memberRecordEditor:editor});
}
installMemberWorkspace(Core);
