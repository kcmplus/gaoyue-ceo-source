import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const app = resolve(root, 'ceo-workbench');
export const dist = resolve(root, 'dist');
export const builders = [
  'build-oa.mjs', 'build-governance.mjs',
  'build-operations.mjs', 'build-oa-upgrade.mjs',
];

export function build() {
  for (const file of builders) {
    const result = spawnSync(process.execPath, [resolve(app, file)], {
      cwd: root, encoding: 'utf8', timeout: 120000,
    });
    if (result.error || result.status !== 0) {
      throw new Error(`Build failed: ${file}\n${result.error?.message || ''}\n${result.stdout || ''}${result.stderr || ''}`);
    }
    console.log(`BUILD ${file}`);
  }
  const html = readFileSync(resolve(app, 'index.html'), 'utf8');
  const start = html.indexOf('<script>'), end = html.lastIndexOf('</script>');
  if (start < 0 || end <= start) throw new Error('Missing application script');
  new Function(html.slice(start + 8, end));
  mkdirSync(dist, { recursive: true });
  // Publish only the standalone app. Unexpected files require a deliberate review.
  const unexpected = readdirSync(dist).filter(name => name !== 'index.html');
  if (unexpected.length) throw new Error(`Unexpected files in dist: ${unexpected.join(', ')}`);
  writeFileSync(resolve(dist, 'index.html'), html);
  console.log('READY dist/index.html');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();
