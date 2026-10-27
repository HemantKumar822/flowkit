import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const hash = (x) => crypto.createHash('sha256').update(x).digest('hex');
export const now = () => new Date().toISOString();
export function assertPlainPath(target) {
  let p = path.resolve(target);
  for (;;) {
    try {
      if (fs.lstatSync(p).isSymbolicLink()) throw Error(`Symlink/reparse path refused: ${p}`);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }
}
export function atomicJSON(file, value) {
  assertPlainPath(file);
  const temp = `${file}.${crypto.randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(temp, file);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}
export function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
export function nonempty(x, label) {
  if (typeof x !== 'string' || !x.trim()) throw Error(`${label} must be nonempty`);
  return x.trim();
}
export function strings(x, label) {
  if (!Array.isArray(x) || !x.length || x.some((v) => typeof v !== 'string' || !v.trim()))
    throw Error(`${label} must be a nonempty string array`);
  return x.map((v) => v.trim());
}
export function boundedText(x) {
  return String(x ?? '')
    .replace(/\b(?:gh[pousr]_[A-Za-z0-9_]+|sk-[A-Za-z0-9_-]{15,})\b/g, '[REDACTED]')
    .slice(-16000);
}
