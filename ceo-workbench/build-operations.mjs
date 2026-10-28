import {readFile,writeFile} from 'node:fs/promises';
let h=await readFile(new URL('index.html',import.meta.url),'utf8');
for(const [tag,file,anchor]of [['WORKLOAD UI','workload-ui.js','function title(kicker,'],['WORKLOAD CSS','workload.css','</style>'],['OPERATIONS CORE','operations-core.js','function boot(){'],['OPERATIONS UI','operations-ui.js','function title(kicker,'],['OPERATIONS CSS','operations.css','</style>'],['NAVIGATION UI','navigation-ui.js','function title(kicker,'],['NAVIGATION CSS','navigation.css','</style>']]){let body;try{body=await readFile(new URL(file,import.meta.url),'utf8')}catch{continue}const block='/* '+tag+' START */\n'+body+'\n/* '+tag+' END */\n';if(h.includes('/* '+tag+' START */'))h=h.replace(new RegExp('/\\* '+tag+' START \\*/[\\s\\S]*?/\\* '+tag+' END \\*/\\n?'),()=>block);else h=h.replace(anchor,block+anchor)}
h=h.replace('parsed.data.governanceVersion!==1;','parsed.data.governanceVersion!==1||parsed.data.operationsVersion!==1;');
if(h.includes('/* OPERATIONS UI START */')){
 h=h.replace('inbox:"统一待办",archives:','inbox:"统一待办",operations:"管理工具",archives:').replace('const symbols={inbox:','const symbols={operations:"⚙",inbox:').replace('const renderer={inbox:','const renderer={operations:operationsView,inbox:');
 if(!h.includes('installOperationsUI();'))h=h.replace('installGovernanceUI();','installGovernanceUI();\ninstallOperationsUI();');
 if(!h.includes('if(a==="operations")'))h=h.replace('if(a==="governance")','if(a==="operations")operationsCommand(b.dataset.op,id,b);\nelse if(a==="governance")');
 h=h.replace('data=C.scoped(full,user,options);','data=C.scoped(full,user,{...options,asOf});');
 h=h.replace(/\$\("nav"\)\.innerHTML=Object\.entries\(names\)[^\n]+;/,'$("nav").innerHTML=renderNavigation(pending,risks);');
 if(!h.includes('const navGroup=e.target.closest'))h=h.replace('const nav=e.target.closest("[data-view]");','const navGroup=e.target.closest("[data-nav-group]");if(navGroup){toggleNavigationGroup(navGroup.dataset.navGroup);return}\nconst nav=e.target.closest("[data-view]");');
 h=h.replace('$("crumb").textContent=names[view];','$("crumb").textContent=(navigationGroupFor(view)?.name||"工作台")+" / "+names[view];');
 // De-duplicate help paragraphs retained by earlier repeated builds.
 h=h.replace(/(<p><b>7\.<\/b>[\s\S]*?<\/p>)(?:\1)+/g,'$1');
 h=h.replace('个人待办仅本人维护，档案登记按行政及管理权限处理。','个人待办仅本人可见和维护，档案登记按行政及管理权限处理。');
}
await writeFile(new URL('index.html',import.meta.url),h);const script=h.slice(h.indexOf('<script>')+8,h.lastIndexOf('</script>'));await writeFile(new URL('core.js',import.meta.url),script.slice(0,script.indexOf('function boot()')));console.log('Operations embedded');
