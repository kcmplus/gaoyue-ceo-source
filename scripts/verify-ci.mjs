import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { app, dist, build } from './build.mjs';

// No browser or external dependencies: these suites also run on Ubuntu Actions.
const suites = [
  'verify.mjs', 'verify-oa.mjs', 'verify-project-delete.mjs',
  'verify-admin.mjs', 'verify-member.mjs', 'verify-governance.mjs',
  'verify-operations.mjs', 'verify-workload.mjs', 'verify-workforce.mjs',
  'verify-work-calendar.mjs', 'verify-work-tasks.mjs', 'verify-work-acceptance.mjs',
  'verify-finance-office.mjs', 'verify-notice-policy.mjs',
  'verify-work-integration.mjs', 'verify-review-fixes.mjs', 'verify-office-edges.mjs',
];

build();
const failures = [];
for (const suite of suites) {
  const result = spawnSync(process.execPath, [resolve(app, suite)], {
    cwd: app, encoding: 'utf8', timeout: 120000,
  });
  const passed = !result.error && result.status === 0;
  console.log(`${passed ? 'PASS' : 'FAIL'} ${suite}`);
  if (!passed) {
    failures.push(suite);
    console.error(result.error?.message || '', result.stdout || '', result.stderr || '');
  }
}
assert.equal(failures.length, 0, `Failed suites: ${failures.join(', ')}`);

const before = readFileSync(resolve(app, 'index.html'));
const coreBefore = readFileSync(resolve(app, 'core.js'));
build();
assert.deepEqual(readFileSync(resolve(app, 'index.html')), before, 'Repeated build changed the app');
assert.deepEqual(readFileSync(resolve(app, 'core.js')), coreBefore, 'Repeated build changed the test core');
assert.deepEqual(readFileSync(resolve(dist, 'index.html')), before, 'Published app differs from tested app');
assert.deepEqual(readdirSync(dist), ['index.html'], 'Unexpected deployment content');
console.log(`PASS ${suites.length} suites + repeatable build + deployment content`);
