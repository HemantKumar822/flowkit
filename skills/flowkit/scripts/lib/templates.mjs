import fs from 'node:fs';
import path from 'node:path';
import { assertPlainPath, hash, readJSON } from './common.mjs';

export function listTemplates(skillRoot) {
  const registryPath = path.join(skillRoot, 'third-party', 'sources.json');
  assertPlainPath(registryPath);
  const registry = readJSON(registryPath);
  return registry.sources.flatMap((source) =>
    source.adaptations.map((file) => ({
      id: file.id,
      path: file.path,
      sha256: file.sha256,
      upstream: source.project,
      license: source.license,
      description: file.description,
    })),
  );
}

export function readTemplate(skillRoot, id) {
  const template = listTemplates(skillRoot).find((item) => item.id === id);
  if (!template) throw Error('Unknown template; use templates to list available names');
  if (!/^references\/templates\/[a-z0-9-]+\.md$/.test(template.path))
    throw Error('Invalid template path');
  const file = path.join(skillRoot, template.path);
  assertPlainPath(file);
  const bytes = fs.readFileSync(file);
  if (hash(bytes) !== template.sha256)
    throw Error('Template integrity mismatch; inspect the installed source');
  return bytes.toString('utf8');
}

export function verifyTemplateBundle(skillRoot) {
  const manifestPath = path.join(skillRoot, 'third-party/sources.json');
  assertPlainPath(manifestPath);
  const manifest = readJSON(manifestPath);
  if (manifest.schema !== 1 || !Array.isArray(manifest.sources))
    throw Error('Invalid provenance schema');
  const seen = new Set();
  for (const source of manifest.sources) {
    if (!/^[a-f0-9]{40}$/.test(source.commit) || source.license !== 'MIT')
      throw Error('Invalid audited source metadata');
    if (!/^third-party\/[a-z-]+\/LICENSE$/.test(source.licensePath))
      throw Error('Invalid license path');
    const licensePath = path.join(skillRoot, source.licensePath);
    assertPlainPath(licensePath);
    if (hash(fs.readFileSync(licensePath)) !== source.licenseSha256)
      throw Error('Upstream license integrity mismatch');
    for (const notice of source.notices || []) {
      if (!/^third-party\/[a-z-]+\/[A-Z_]+\.md$/.test(notice.path))
        throw Error('Invalid notice path');
      const noticePath = path.join(skillRoot, notice.path);
      assertPlainPath(noticePath);
      if (hash(fs.readFileSync(noticePath)) !== notice.sha256)
        throw Error('Upstream notice integrity mismatch');
    }
    for (const input of source.sourceFiles) {
      if (!/^[a-f0-9]{64}$/.test(input.sha256)) throw Error('Invalid input source hash');
    }
    for (const file of source.adaptations) {
      if (seen.has(file.id)) throw Error('Duplicate template identity');
      seen.add(file.id);
      readTemplate(skillRoot, file.id);
    }
  }
  return { sources: manifest.sources.length, templates: seen.size };
}
