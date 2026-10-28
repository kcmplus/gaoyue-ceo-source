const navigationGroups=[
  {id:'workspace',name:'工作台',icon:'◫',items:['overview','member','inbox']},
  {id:'projects',name:'项目管理',icon:'⌘',items:['path','tasks','timeline','risks','archives']},
  {id:'resources',name:'组织与资源',icon:'♙',items:['oa','hr','finance','org']},
  {id:'management',name:'管理与决策',icon:'◇',items:['approvals','operations','history']}
];
let navigationPerson='',navigationLastView='',navigationExpanded={};
function navigationGroupFor(key){return navigationGroups.find(group=>group.items.includes(key))}
function saveNavigationState(){try{localStorage.setItem('gaoyue-navigation-'+user.person,JSON.stringify(navigationExpanded))}catch{}}
function renderNavigation(pending,risks){
  if(navigationPerson!==user.person){
    navigationPerson=user.person;navigationLastView='';navigationExpanded={};
    try{const stored=JSON.parse(localStorage.getItem('gaoyue-navigation-'+user.person)||'{}');for(const group of navigationGroups)if(typeof stored?.[group.id]==='boolean')navigationExpanded[group.id]=stored[group.id]}catch{}
  }
  if(navigationLastView!==view){const group=navigationGroupFor(view);if(group)navigationExpanded[group.id]=true;navigationLastView=view;saveNavigationState()}
  const visible=key=>!(['overview','org'].includes(key)&&!C.workforceCan(data,user,'company-work-read'))&&(key!=='finance'||C.canFinance(data,user));
  const count=key=>key==='approvals'?pending:key==='risks'?risks:0;
  return navigationGroups.map(group=>{
    const keys=group.items.filter(visible);if(!keys.length)return '';
    const active=keys.includes(view),open=!!navigationExpanded[group.id],total=keys.reduce((n,key)=>n+count(key),0);
    return `<section class="nav-group ${active?'current-group':''}"><button type="button" class="nav-group-toggle" data-nav-group="${group.id}" aria-expanded="${open}" aria-controls="nav-children-${group.id}"><span class="nav-group-icon" aria-hidden="true">${group.icon}</span><span class="nav-group-label">${group.name}</span>${total?`<b class="nav-group-count" aria-label="${total} 项提醒">${total}</b>`:''}<span class="nav-chevron" aria-hidden="true">${open?'⌄':'›'}</span></button><div class="nav-children" id="nav-children-${group.id}" ${open?'':'hidden'}>${keys.map(key=>`<button type="button" class="navitem ${view===key?'active':''}" data-view="${key}" ${view===key?'aria-current="page"':''}><span aria-hidden="true">${symbols[key]}</span>${names[key]}${count(key)?`<b>${count(key)}</b>`:''}</button>`).join('')}</div></section>`
  }).join('')
}
function toggleNavigationGroup(id){
  if(!navigationGroups.some(group=>group.id===id))return;
  navigationExpanded[id]=!navigationExpanded[id];saveNavigationState();
  withScope(()=>{const pending=C.inbox(data,user,asOf).filter(r=>r.category==='approve'||r.category==='accept').length,risks=data.tasks.filter(t=>C.late(t,asOf)||t.obstacle).length;$('nav').innerHTML=renderNavigation(pending,risks)});
  $('nav').querySelector?.(`[data-nav-group="${id}"]`)?.focus();
}
