import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  listTemplates,
  readTemplate,
  verifyTemplateBundle,
} from '../skills/flowkit/scripts/lib/templates.mjs';
import os from 'node:os';

const root = path.resolve('skills/flowkit');

test('bundled templates work without any external skill installation', () => {
  const templates = listTemplates(root);
  assert.deepEqual(templates.map((x) => x.id).sort(), [
    'architecture',
    'brief',
    'engineering-review',
    'independent-review',
    'story',
  ]);
  for (const template of templates) {
    const content = readTemplate(root, template.id);
    assert.ok(content.length > 200);
    assert.match(content, /Adapted from/);
    assert.match(content, /MIT/);
  }
  assert.throws(() => readTemplate(root, '../../LICENSE'), /template/i);
  assert.throws(() => readTemplate(root, 'unknown'), /template/i);
});

test('every derivative carries exact source provenance and full upstream notices', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'third-party/sources.json'), 'utf8'));
  for (const source of manifest.sources) {
    assert.match(source.commit, /^[a-f0-9]{40}$/);
    assert.equal(source.license, 'MIT');
    const license = fs.readFileSync(path.join(root, source.licensePath), 'utf8');
    assert.match(license, /Copyright/);
    assert.match(license, /Permission is hereby granted/);
    assert.match(license, /THE SOFTWARE IS PROVIDED/);
    if (source.id === 'bmad') {
      for (const name of ['CONTRIBUTORS.md', 'TRADEMARK.md']) {
        assert.match(
          fs.readFileSync(path.join(root, 'third-party/bmad', name), 'utf8'),
          /https:\/\/github.com\/bmad-code-org/,
        );
      }
    }
    for (const file of source.sourceFiles) assert.match(file.sha256, /^[a-f0-9]{64}$/);
    for (const file of source.adaptations) {
      const bytes = fs.readFileSync(path.join(root, file.path));
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), file.sha256);
      assert.ok(file.changes.length > 20);
    }
  }
});

test('real CLI lists and prints curated content, refuses unknown names', () => {
  const cli = (...args) =>
    spawnSync(process.execPath, [path.resolve('bin/flowkit.mjs'), ...args], {
      encoding: 'utf8',
      timeout: 20000,
    });
  const listed = cli('templates');
  assert.equal(listed.status, 0, listed.stderr);
  assert.equal(JSON.parse(listed.stdout).length, 5);
  const printed = cli('template', 'brief');
  assert.equal(printed.status, 0, printed.stderr);
  assert.match(printed.stdout, /Product brief/i);
  assert.notEqual(cli('template', '../LICENSE').status, 0);
});

test('bundle verification detects changed derivative and license content', () => {
  assert.deepEqual(verifyTemplateBundle(root), { sources: 3, templates: 5 });
  const copy = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'flowkit-provenance-'));
  fs.cpSync(root, copy, { recursive: true });
  fs.appendFileSync(path.join(copy, 'references/templates/product-brief.md'), 'changed');
  assert.throws(() => verifyTemplateBundle(copy), /integrity|hash/i);
  fs.copyFileSync(
    path.join(root, 'references/templates/product-brief.md'),
    path.join(copy, 'references/templates/product-brief.md'),
  );
  fs.appendFileSync(path.join(copy, 'third-party/bmad/LICENSE'), 'changed');
  assert.throws(() => verifyTemplateBundle(copy), /license|integrity|hash/i);
  fs.copyFileSync(
    path.join(root, 'third-party/bmad/LICENSE'),
    path.join(copy, 'third-party/bmad/LICENSE'),
  );
  fs.unlinkSync(path.join(copy, 'third-party/bmad/TRADEMARK.md'));
  assert.throws(() => verifyTemplateBundle(copy), /notice|ENOENT/i);
});
