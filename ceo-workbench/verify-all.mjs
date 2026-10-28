import {spawnSync} from 'node:child_process';
import {writeFileSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const cwd=fileURLToPath(new URL('.',import.meta.url)),results=[];
const buildFiles=['build-oa.mjs','build-governance.mjs','build-operations.mjs','build-oa-upgrade.mjs'];
for(const file of buildFiles){const r=spawnSync(process.execPath,[file],{cwd,encoding:'utf8'});assert.equal(r.status,0,r.stderr)}
for(const file of ['verify.mjs','verify-management.mjs','verify-oa.mjs','verify-oa-browser.mjs','verify-project-delete.mjs','verify-project-delete-browser.mjs','verify-admin.mjs','verify-admin-browser.mjs','verify-member.mjs','verify-member-browser.mjs','verify-governance.mjs','verify-governance-browser.mjs','verify-resilience-browser.mjs','verify-operations.mjs','verify-operations-browser.mjs','verify-navigation-browser.mjs','verify-workload.mjs','verify-workforce.mjs','verify-work-calendar.mjs','verify-work-tasks.mjs','verify-work-acceptance.mjs','verify-finance-office.mjs','verify-notice-policy.mjs','verify-work-integration.mjs','verify-oa-upgrade-browser.mjs','verify-review-fixes.mjs','verify-finance-policy-browser.mjs','verify-office-edges.mjs']){
  const r=spawnSync(process.execPath,[file],{cwd,encoding:'utf8',timeout:120000});
  results.push({file,passed:r.status===0,output:(r.stdout||'')+(r.stderr||''),error:r.error?.message});
  console.log((r.status===0?'PASS ':'FAIL ')+file);
  if(r.status!==0)console.log(results.at(-1).output);
}
const before=readFileSync(new URL('index.html',import.meta.url),'utf8');
const builds=buildFiles.map(file=>spawnSync(process.execPath,[file],{cwd,encoding:'utf8'}));
results.push({file:'complete build idempotence',passed:builds.every(r=>r.status===0)&&before===readFileSync(new URL('index.html',import.meta.url),'utf8')});
writeFileSync(new URL('validation-summary.json',import.meta.url),JSON.stringify({time:new Date().toISOString(),passed:results.filter(r=>r.passed).length,total:results.length,isolatedBrowser:true,results},null,2));
assert.ok(results.every(r=>r.passed),'One or more regression suites failed');console.log(results.length+'/'+results.length+' suites passed');
