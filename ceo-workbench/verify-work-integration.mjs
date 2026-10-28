import assert from 'node:assert/strict';
import {fixture,run} from './verify-oa-upgrade-fixture.mjs';
const {C,d,users:u}=fixture(),ctx={now:'2026-10-19T10:00:00.000Z',zone:'Asia/Shanghai'};
const task=(who,op,values={},id)=>run(C,d,who,'work-tasks',op,values,id);
const tpl=task(u.gm,'template-save',{name:'已发布标准',requirement:'每日交接成果',frequency:'workday',weekday:1,deadline:'shift_end',time:'18:00'});
task(u.gm,'template-publish',{},tpl.id);task(u.supervisor,'allocation-save',{template:tpl.id,member:'demo-worker',from:'2026-10-19',to:'2026-10-23',priority:'P1'});
task(u.gm,'template-save',{...tpl,name:'尚未发布的新草稿'},tpl.id);task(u.employee,'generate',{memberIds:['demo-worker'],from:'2026-10-19',to:'2026-10-19'});
assert.equal(d.workTasks.items.find(t=>t.template===tpl.id)?.name,'已发布标准');
const item=d.workTasks.items.find(t=>t.template===tpl.id);task(u.employee,'commitment',{ref:{kind:'work',id:item.id},week:'2026-10-19',complexity:2,deliverable:'完成当班交接记录'});
assert.equal(d.workTasks.commitments.length,1);
const snap=C.clone(d);assert.throws(()=>task(u.outsider,'commitment',{ref:{kind:'work',id:item.id},week:'2026-10-19',complexity:3,deliverable:'越权'}));assert.deepEqual(d,snap);
assert.ok(C.workSummary(d,u.gm,ctx).daily>0);assert.equal(C.workSummary(d,u.outsider,ctx).daily,0);
// Outsider assigned to joint acceptance gets only the review packet, not project access.
const joint=task(u.supervisor,'joint-submit',{stage:'s1',reviewer:'zhou',evidence:'原阶段成果检查通过'});
assert.equal(C.readProject(d,u.outsider,'kcg'),false);assert.ok(C.scoped(d,u.outsider).governance.stageReviews.some(r=>r.id===joint.id));
task(u.outsider,'joint-decide',{approve:true,note:'已核对本版提交标准与成果'},joint.id);
// Cover worker submits the authorized task, with original owner and actual author retained.
const chen={role:'operator',person:'chen'},coverUser={role:'operator',person:'demo-worker'};
const leave=run(C,d,chen,'admin','personnel',{category:'请假',title:'采购请假',subject:'chen',project:'',start:'2026-10-07',end:'2026-10-20',hours:8,reason:'个人事项',approver:'lin',details:{}});
run(C,d,u.supervisor,'admin','personnel-decide',{approve:true,note:'同意'},leave.id);
const cover=task(u.supervisor,'absence-resolve',{request:leave.id,ref:{kind:'project',id:'t3'},disposition:'substitute',substitute:'demo-worker',reason:'临时协助'});
task(coverUser,'substitute-accept',{},cover.id);d.tasks.find(t=>t.id==='t3').obstacle='';
task(coverUser,'submit',{ref:{kind:'project',id:'t3'},result:'代办已确认交期',attachments:[]});
assert.equal(d.tasks.find(t=>t.id==='t3').owner,'chen');assert.equal(d.tasks.find(t=>t.id==='t3').submissions.at(-1).author,'demo-worker');
assert.equal(C.readProject(d,coverUser,'kcg'),false);
assert.ok(C.scoped(d,coverUser).workDelegatedTasks.some(t=>t.id==='t3'));
// Old notification entry cannot bypass effectiveness.
const n=run(C,d,u.ceo,'notice-policy','publish',{title:'未来重要制度',body:'未来生效',category:'制度',importance:'important',members:['demo-worker'],departments:[],positions:[],effectiveAt:'2027-01-01T00:00:00.000Z',deadlineAt:'2027-01-02T00:00:00.000Z'});
assert.throws(()=>C.change(d,coverUser,{type:'oa',op:'ack',id:n.id,context:ctx}));
console.log('PASS integration: published snapshots, commitments, scoped overview, minimal joint review, project cover, legacy notice guard');
