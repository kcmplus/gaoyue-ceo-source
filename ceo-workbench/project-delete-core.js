function installProjectDeletion(C){
const previous=C.change;
function deletionPlan(d,id){
 const project=d.projects.find(p=>p.id===id);if(!project)throw Error('项目不存在');
 if(project.kind==='function'||['hr','fin'].includes(id))throw Error('人力资源与财务属于职能模块，不能作为业务项目删除');
 const stages=d.stages.filter(s=>s.project===id),stageIds=new Set(stages.map(s=>s.id));
 const milestones=d.milestones.filter(m=>stageIds.has(m.stage)),milestoneIds=new Set(milestones.map(m=>m.id));
 const tasks=d.tasks.filter(t=>milestoneIds.has(t.milestone)),taskIds=new Set(tasks.map(t=>t.id));
 const dependents=d.tasks.filter(t=>!taskIds.has(t.id)&&t.deps.some(id=>taskIds.has(id)));
 const counts={目标:stages.length,关键结果:milestones.length,行动:tasks.length,审批:d.approvals.filter(a=>a.project===id).length,人才需求:d.staffing.filter(x=>x.project===id).length,财务记录:d.finance.filter(x=>x.project===id).length,复盘:d.reviews.filter(x=>x.project===id).length,办公事项:Object.values(d.oa||{}).reduce((n,rows)=>n+rows.filter(x=>x.project===id).length,0)};
 return {project,stageIds,milestoneIds,taskIds,dependents,counts};
}
C.deletionPlan=deletionPlan;
C.change=function(data,user,cmd){
 if(cmd.type!=='delete-project')return previous(data,user,cmd);
 if(user.role!=='ceo'||data.members.find(m=>m.id===user.person)?.level!=='ceo')throw Error('仅 CEO 可删除项目');
 const d=C.clone(data),plan=deletionPlan(d,cmd.id);
 if(cmd.confirm!==plan.project.name)throw Error('请输入完整项目名称确认删除');
 if(plan.dependents.length)throw Error('其他项目仍有任务依赖本项目，请先调整依赖：'+plan.dependents.map(t=>t.name).join('、'));
 d.projects=d.projects.filter(p=>p.id!==cmd.id);
 d.stages=d.stages.filter(s=>!plan.stageIds.has(s.id));
 d.milestones=d.milestones.filter(m=>!plan.milestoneIds.has(m.id));
 d.tasks=d.tasks.filter(t=>!plan.taskIds.has(t.id));
 for(const key of ['approvals','staffing','finance','reviews'])d[key]=d[key].filter(r=>r.project!==cmd.id);
 for(const key of Object.keys(d.oa||{}))d.oa[key]=d.oa[key].filter(r=>r.project!==cmd.id);
 d.members.forEach(m=>m.projects=m.projects.filter(id=>id!==cmd.id));
 d.history.unshift({id:C.uid(),time:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'}),actor:'ceo / '+d.members.find(m=>m.id===user.person).name,action:'delete-project',target:plan.project.name,reason:'CEO确认删除项目及关联记录；保留成员档案与历史，可导入删除前备份恢复。',before:{project:plan.project,counts:plan.counts},after:null});
 C.cleanupProject?.(d,cmd.id);C.validate(d);Object.keys(data).forEach(k=>delete data[k]);Object.assign(data,d);return plan.counts;
};
}
installProjectDeletion(Core);
