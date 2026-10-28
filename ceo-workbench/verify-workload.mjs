import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const C=new Function(readFileSync(new URL('core.js',import.meta.url),'utf8')+';return Core')();
const src=readFileSync(new URL('workload-ui.js',import.meta.url),'utf8');
const ceo={role:'ceo',person:'ceo'},chen={role:'operator',person:'chen'};
const create=(d,u=ceo)=>new Function('C','data','user',`
const asOf='2026-10-09';let opsWeek='';
const esc=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const opsDateAdd=(date,n)=>new Date(Date.parse(date)+n*86400000).toISOString().slice(0,10);
const opsMonday=date=>opsDateAdd(date,-((new Date(date).getUTCDay()+6)%7));
const opsButton=(label,op,id='',extra='',cls='')=>'<button data-op="'+op+'" data-id="'+id+'" '+extra+'>'+label+'</button>';
const button=(label)=>label,badge=(label)=>'<span>'+label+'</span>',empty=s=>s,who=id=>data.members.find(m=>m.id===id)?.name||id;
let output='',modal='';const render=()=>output=workloadView(),notify=s=>s,withScope=f=>f(),showModal=(title,body)=>modal=title+body;
${src}
return {render,rows:workloadRows,command:workloadCommand,get html(){return output},get modal(){return modal},week(value){opsWeek=value;render()}};
`)(C,C.scoped(d,u,{asOf:'2026-10-09'}),u);
let count=0;const check=(name,fn)=>{fn();count++;console.log('PASS '+name)};
check('same scoped counts, inactive members collapsed and first actionable member expanded',()=>{const d=C.seed(),v=create(d);v.render();const rows=v.rows('2026-10-05'),tasks=rows.reduce((n,r)=>n+r.tasks.length,0);assert.match(v.html,new RegExp('<strong>'+tasks+'</strong>'));assert.match(v.html,/成员周承诺对照表/);assert.match(v.html,/id="workloadIdleList"[^>]*hidden/);assert.match(v.html,/id="workload-detail-chen" class="workload-detail-row" >/);assert.match(v.html,/未登记/)});
check('filters isolate matching people while retaining overall scoped totals',()=>{const v=create(C.seed());v.render();v.command('workload-filter','late');const rows=[...v.html.matchAll(/class="workload-member-row[^"]*" data-member="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(rows.sort(),['chen','li']);assert.match(v.html,/aria-pressed="true">仅看逾期/);v.command('workload-filter','all');assert.ok(v.html.includes('data-member="wu"'))});
check('expand, collapse and empty-member disclosure states work',()=>{const v=create(C.seed());v.render();v.command('workload-toggle','chen');assert.match(v.html,/id="workload-detail-chen" class="workload-detail-row" hidden/);v.command('workload-empty','');assert.match(v.html,/id="workloadIdleList" class="workload-idle-list" >/);v.command('workload-empty','');assert.match(v.html,/id="workloadIdleList"[^>]*hidden/)});
check('registered commitments show deliverable, complexity and escaped text',()=>{const d=C.seed();C.change(d,ceo,{type:'operations',op:'commitment',values:{task:'t3',week:'2026-10-05',complexity:3,deliverable:'<img src=x> 采购交期确认'},asOf:'2026-10-09'});const v=create(d);v.render();assert.match(v.html,/&lt;img src=x>/);assert.match(v.html,/3 点/);assert.match(v.html,/查看 \/ 修改承诺/);v.command('workload-filter','pending');assert.ok(!/data-member="chen"/.test(v.html))});
check('operator view cannot reveal other member tasks or commitments',()=>{const v=create(C.seed(),chen);v.render();assert.match(v.html,/锁定首批采购与交期/);assert.ok(!v.html.includes('商场点位条件确认'));assert.ok(!v.html.includes('data-member="li"'))});
check('absence requiring handoff stays visible even without tasks',()=>{const d=C.seed();d.admin.personnel.push({id:'test-leave',subject:'lin',category:'请假',status:'approved',start:'2026-10-09',end:'2026-10-10'});const v=create(d);v.render();assert.match(v.html,/data-member="lin"/);v.command('workload-toggle','lin');assert.match(v.html,/data-op="coverage-new" data-id="test-leave"/)});
check('week change resets filtering and expansion without inventing commitments',()=>{const v=create(C.seed());v.render();v.command('workload-filter','late');v.week('2026-10-12');assert.match(v.html,/aria-pressed="true">全部成员/);assert.match(v.html,/已登记复杂度/)});
check('empty scope renders readable guidance and no undefined totals',()=>{const d=C.seed();for(const t of d.tasks)t.status='done';const v=create(d);v.render();assert.match(v.html,/当前范围暂无本周行动或交接安排/);assert.ok(!v.html.includes('NaN'));v.command('workload-filter','pending');assert.match(v.html,/没有符合此筛选的成员/)});
console.log(count+' workload checks passed');
