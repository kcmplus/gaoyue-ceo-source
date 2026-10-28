let workloadFilter='all',workloadShowEmpty=false,workloadExpanded=new Set(),workloadContext='';
function workloadRows(week){
  const end=opsDateAdd(week,6);
  return data.members.filter(m=>C.memberVisible(data,user,m.id)&&C.adminActive(data,m.id)).map(member=>{
    const tasks=data.tasks.filter(t=>t.owner===member.id&&t.status!=='done'&&C.opsRunning(data,C.projectOf(data,t).id)&&t.start<=end);
    const commitments=data.operations.commitments.filter(c=>c.member===member.id&&c.week===week&&tasks.some(t=>t.id===c.task));
    const leaves=data.admin.personnel.filter(p=>p.subject===member.id&&['请假','出差','调休'].includes(p.category)&&['approved','completed'].includes(p.status)&&p.start<=end&&p.end>=week);
    return {member,tasks,commitments,leaves,late:tasks.filter(t=>C.late(t,asOf)).length,pending:tasks.length-commitments.length,complexity:commitments.reduce((sum,c)=>sum+c.complexity,0)};
  });
}
function workloadCanEdit(t){return t.owner===user.person||C.manageable(data,user,C.projectOf(data,t).id)}
function workloadMatches(r){return workloadFilter==='pending'?r.pending>0:workloadFilter==='late'?r.late>0:true}
function workloadTaskRows(r){
  const tasks=r.tasks.filter(t=>workloadFilter==='pending'?!r.commitments.some(c=>c.task===t.id):workloadFilter==='late'?C.late(t,asOf):true);
  return tasks.map(t=>{
    const c=r.commitments.find(c=>c.task===t.id),edit=workloadCanEdit(t);
    return `<tr class="workload-task-row"><td data-label="本周行动"><b>${esc(t.name)}</b>${c?`<p class="workload-promise">承诺：${esc(c.deliverable)}</p>`:''}</td><td data-label="截止日期">${esc(t.end)}</td><td data-label="状态"><div class="workload-badges">${C.late(t,asOf)?badge('逾期','red'):''}${badge(c?'已登记':'待登记',c?'green':'amber')}</div></td><td data-label="复杂度">${c?c.complexity+' 点':'未登记'}</td><td data-label="操作">${c?opsButton(edit?'查看 / 修改承诺':'查看承诺',edit?'commitment':'workload-view',t.id,'','link'):edit?opsButton('登记周承诺','commitment',t.id,'','primary'):button('查看行动','task',t.id,'','link')}</td></tr>`;
  }).join('');
}
function workloadMemberRow(r){
  const {member:m,tasks,commitments,leaves}=r,open=workloadExpanded.has(m.id),detailId='workload-detail-'+m.id;
  return `<tr class="workload-member-row ${open?'is-open':''}" data-member="${esc(m.id)}"><th scope="row">${opsButton(esc(m.name),'workload-toggle',m.id,`aria-expanded="${open}" aria-controls="${esc(detailId)}"`,'workload-member-button')}</th><td data-label="行动数">${tasks.length}</td><td data-label="已登记承诺">${commitments.length} 项</td><td data-label="已登记复杂度">${commitments.length?r.complexity+' 点':'未登记'}</td><td data-label="需关注"><div class="workload-badges">${r.late?badge('逾期 '+r.late,'red'):''}${r.pending?badge('待登记 '+r.pending,'amber'):''}${leaves.length?badge('需交接 '+leaves.length,'amber'):''}${!r.late&&!r.pending&&!leaves.length?'<span class="muted">—</span>':''}</div></td><td data-label="操作">${opsButton(open?'收起':'展开','workload-toggle',m.id,`aria-expanded="${open}" aria-controls="${esc(detailId)}"`,'workload-expand')}</td></tr><tr id="${esc(detailId)}" class="workload-detail-row" ${open?'':'hidden'}><td colspan="6"><div class="workload-detail">${workloadFilter!=='all'?`<p class="workload-filter-note">仅显示${workloadFilter==='pending'?'待登记承诺':'逾期'}行动；上方成员数字为本周完整汇总。</p>`:''}${leaves.map(p=>`<div class="workload-leave"><span><b>${esc(p.category)}</b> ${esc(p.start)} — ${esc(p.end)}</span>${opsButton('接手安排','coverage-new',p.id)}</div>`).join('')}${tasks.length?`<table class="workload-task-table"><caption class="workload-sr">${esc(m.name)}的行动与周承诺</caption><thead><tr><th scope="col">本周行动</th><th scope="col">截止日期</th><th scope="col">状态</th><th scope="col">复杂度</th><th scope="col">操作</th></tr></thead><tbody>${workloadTaskRows(r)}</tbody></table>`:'<p class="muted">暂无本周行动</p>'}</div></td></tr>`;
}
function workloadView(){
  const week=opsWeek||opsMonday(asOf),end=opsDateAdd(week,6),rows=workloadRows(week),context=user.role+':'+user.person+':'+week;
  const active=rows.filter(r=>r.tasks.length||r.leaves.length),idle=rows.filter(r=>!r.tasks.length&&!r.leaves.length);
  if(workloadContext!==context){workloadContext=context;workloadFilter='all';workloadShowEmpty=false;workloadExpanded=new Set(active[0]?[active[0].member.id]:[])}
  const visible=active.filter(workloadMatches),totals=rows.reduce((a,r)=>({tasks:a.tasks+r.tasks.length,registered:a.registered+r.commitments.length,late:a.late+r.late}),{tasks:0,registered:0,late:0});
  return `<section class="panel workload-panel"><div class="workload-heading"><div><h2>本周承诺与工作量</h2><p>一眼看清每位成员的行动与承诺</p></div><div class="workload-week"><label for="opsWeek">周起始日</label><input type="date" id="opsWeek" value="${esc(week)}"><span>至 ${esc(end)}</span>${opsButton('口径说明','workload-help','','','link')}</div></div><div class="workload-summary" aria-label="当前授权范围的全体成员汇总"><div><strong>${totals.tasks}</strong><span>本周及逾期行动</span></div><div><strong>${totals.registered}<small> / ${totals.tasks}</small></strong><span>已登记周承诺</span></div><div class="workload-overdue"><strong>${totals.late}</strong><span>逾期行动</span></div></div><div class="workload-toolbar"><div class="workload-filters" role="group" aria-label="筛选成员">${[['all','全部成员'],['pending','仅看待登记'],['late','仅看逾期']].map(([id,label])=>opsButton(label,'workload-filter',id,`aria-pressed="${workloadFilter===id}"`,workloadFilter===id?'primary':'')).join('')}</div><label class="workload-empty-toggle"><input id="workloadShowEmpty" type="checkbox" ${workloadShowEmpty?'checked':''}> 显示无行动成员</label></div><div class="workload-table-wrap"><table class="workload-table"><caption class="workload-sr">成员周承诺对照表</caption><thead><tr><th scope="col">成员</th><th scope="col">行动数</th><th scope="col">已登记承诺</th><th scope="col">已登记复杂度</th><th scope="col">需关注</th><th scope="col">操作</th></tr></thead><tbody>${visible.map(workloadMemberRow).join('')}</tbody></table>${!visible.length?`<div class="workload-empty-state"><b>${workloadFilter==='all'?'当前范围暂无本周行动或交接安排':'没有符合此筛选的成员'}</b><p>${workloadFilter==='all'?'可以切换周起始日查看其他安排。':'可切回“全部成员”查看完整安排。'}</p>${workloadFilter!=='all'?opsButton('查看全部成员','workload-filter','all'):''}</div>`:''}</div>${idle.length?`<div class="workload-idle">${opsButton(`无本周行动成员 ${idle.length} 人 · ${workloadShowEmpty?'收起':'点击查看'}`,'workload-empty','',`aria-expanded="${workloadShowEmpty}" aria-controls="workloadIdleList"`,'link')}<div id="workloadIdleList" class="workload-idle-list" ${workloadShowEmpty?'':'hidden'}>${idle.map(r=>`<span>${esc(r.member.name)}</span>`).join('')}<small>当前周无未完成行动及交接安排</small></div></div>`:''}<p class="workload-footnote">复杂度仅用于协商安排，不代表绩效；未登记不估算。汇总按当前授权范围计算。</p></section><section class="panel"><h2>临时接手安排</h2><p class="muted">替补需本人确认。安排本身不转移原责任人、不扩大项目权限；需代为推进的行动由负责人正式分派。</p>${data.operations.covers.map(r=>`<div class="queue-row"><div><b>${esc(who(r.subject))} → ${esc(who(r.substitute))}</b><p>${esc(r.start)} → ${esc(r.end)} · ${{proposed:'等待替补确认',accepted:'已确认接手',ended:'已结束'}[r.status]}</p></div>${opsButton('查看安排','coverage-detail',r.id)}</div>`).join('')||empty('暂无临时接手安排')}</section>`;
}
function workloadRender(){
  const focus=typeof document==='undefined'?null:document.activeElement;
  const target=focus?{id:focus.id,op:focus.dataset?.op,key:focus.dataset?.id,member:focus.classList?.contains('workload-member-button')}:null;
  render();
  if(!target||typeof document==='undefined')return;
  const match=[...document.querySelectorAll('[data-op],#workloadShowEmpty,#opsWeek')].find(e=>target.id?e.id===target.id:target.op&&e.dataset.op===target.op&&e.dataset.id===target.key&&e.classList.contains('workload-member-button')===target.member);
  match?.focus({preventScroll:true});
}
function workloadCommand(op,id){
  if(op==='workload-filter'){if(!['all','pending','late'].includes(id))return;workloadFilter=id;workloadRender();return}
  if(op==='workload-toggle'){workloadExpanded.has(id)?workloadExpanded.delete(id):workloadExpanded.add(id);workloadRender();return}
  if(op==='workload-empty'){workloadShowEmpty=!workloadShowEmpty;workloadRender();return}
  if(op==='workload-help')return showModal('本周承诺 · 统计口径','<p>行动数：当前授权范围内，进行中项目中已在所选周结束前开始、尚未验收完成的行动；包含此前逾期与跨周进行的行动。</p><p>已登记承诺：当前责任人在所选周登记的承诺。改派后需由新负责人重新登记。</p><p>已登记复杂度：仅累加已登记的 1—3 点复杂度；未登记显示“未登记”，不代表没有工作量，不估算容量，也不用于绩效排名。</p><p>逾期按顶部演示基准日判断。筛选仅改变列表，汇总数字仍表示当前授权范围的全部成员。</p><p>请假、出差、调休且需要交接的成员始终保留在“全部成员”中。</p>',null);
  if(op==='workload-view')return withScope(()=>{const t=data.tasks.find(t=>t.id===id),r=data.operations.commitments.find(c=>c.task===id&&c.member===t?.owner&&c.week===(opsWeek||opsMonday(asOf)));if(!t||!r)return notify('此行动当前周暂无承诺');showModal('本周承诺 · '+t.name,`<p>责任人：${esc(who(t.owner))}</p><p>周起始日：${esc(r.week)} · 复杂度 ${r.complexity} 点</p><p class="oa-pre">${esc(r.deliverable)}</p>`,null)});
}
