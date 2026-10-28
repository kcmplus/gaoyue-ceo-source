function deleteProjectModal(id){
if(user.role!=='ceo')throw Error('仅 CEO 可删除项目');
if(storageLocked)throw Error('当前本地记录无法读取，请先恢复有效备份再删除');
const plan=C.deletionPlan(data,id);
if(plan.dependents.length){showModal('暂时无法删除项目',`<p>其他项目仍有任务依赖「${esc(plan.project.name)}」，请先调整这些任务的前置依赖。</p>${plan.dependents.map(t=>'<p>'+button(esc(t.name),'task',t.id,'','link')+'</p>').join('')}`,null);return}
let backupSnapshot=null;
showModal('删除项目 · '+plan.project.name,`<p class="red-text"><b>将删除本项目及以下关联记录：</b></p><div class="criteria">${Object.entries(plan.counts).map(([k,n])=>esc(k)+' '+n+' 条').join(' · ')}</div><p>成员档案、其他项目和历史记录会保留。此操作没有撤销按钮；导入删除前的完整备份可恢复，但会替换当时的整个工作台数据。</p><div class="actions"><button type="button" id="deleteBackup">① 下载删除前完整备份</button></div><p id="deleteBackupState" class="muted">请先下载备份，再确认删除。</p><div class="form-grid"><label class="full"><span><input type="checkbox" name="backupConfirm" required style="width:auto"> 我已确认备份文件下载完成</span></label>${field('② 输入完整项目名称：'+plan.project.name,'confirm')}</div>`,fd=>{
assertFresh();
if(!backupSnapshot||backupSnapshot!==JSON.stringify({data,asOf}))throw Error('请先下载当前数据的完整备份；若数据已变化，请重新下载');
if(fd.get('backupConfirm')!=='on')throw Error('请先确认备份文件下载完成');
const previous=data,draft=C.clone(data);C.change(draft,user,{type:'delete-project',id,confirm:fd.get('confirm')});
data=draft;if(!save()){data=previous;render();throw Error('删除未能保存，已保留原数据；请检查浏览器存储后重试')}
selected=businessProjects()[0]?.id||'';moduleProject='';$("modal").close();render();notify('项目及关联记录已删除；删除前备份可用于恢复');
});
$("saveBtn").textContent='确认删除项目';$("deleteBackup").onclick=()=>{try{assertFresh();exportData();backupSnapshot=JSON.stringify({data,asOf});$("deleteBackupState").textContent='已发起备份下载，请确认下载文件后勾选上方确认项。'}catch(err){$("formError").textContent=err.message}};
}
