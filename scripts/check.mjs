import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { verifyTemplateBundle } from '../skills/flowkit/scripts/lib/templates.mjs';
const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.flowkit', 'dist'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith('.mjs')) files.push(p);
    else if (p.endsWith('.json')) JSON.parse(fs.readFileSync(p, 'utf8'));
  }
}
walk(process.cwd());
for (const file of files) {
  const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) {
    process.stderr.write(r.stderr);
    process.exit(1);
  }
}
const version = JSON.parse(fs.readFileSync('skills/flowkit/version.json', 'utf8')).version;
verifyTemplateBundle(path.resolve('skills/flowkit'));
for (const file of [
  'package.json',
  'plugin.json',
  '.claude-plugin/plugin.json',
  '.codex-plugin/plugin.json',
])
  if (JSON.parse(fs.readFileSync(file, 'utf8')).version !== version)
    throw Error(`Version mismatch: ${file}`);
if (fs.readFileSync('LICENSE', 'utf8') !== fs.readFileSync('skills/flowkit/LICENSE', 'utf8'))
  throw Error('Installed skill license differs from root license');
console.log(
  `Syntax checked ${files.length} modules; JSON parsed; versions and licenses synchronized (${version}).`,
);
