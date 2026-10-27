import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { request } from 'node:http';
import { once } from 'node:events';

const serverUrl = new URL('./server.mjs', import.meta.url);
const { createServer } = existsSync(serverUrl) ? await import(serverUrl) : {};

async function withServer(t) {
  assert.equal(typeof createServer, 'function', 'The API must export createServer()');
  const server = createServer();
  assert.equal(server.listening, false, 'Importing/creating the server must not listen');
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

function post(base, body) {
  return fetch(`${base}/api/notes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
}

test('a fresh server returns an empty notes collection', async (t) => {
  const base = await withServer(t);
  const response = await fetch(`${base}/api/notes`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await response.json(), { notes: [] });
});

test('created notes have unique IDs and round-trip in insertion order', async (t) => {
  const base = await withServer(t);
  const created = [];
  for (const title of ['  First note  ', 'Second note']) {
    const response = await post(base, JSON.stringify({ title }));
    assert.equal(response.status, 201);
    const note = await response.json();
    assert.deepEqual(Object.keys(note).sort(), ['id', 'title']);
    assert.ok(note.id);
    assert.equal(note.title, title.trim());
    created.push(note);
  }
  assert.notEqual(created[0].id, created[1].id);
  assert.deepEqual(await (await fetch(`${base}/api/notes`)).json(), { notes: created });
});

test('invalid JSON and invalid titles return 400 without creating notes', async (t) => {
  const base = await withServer(t);
  const bodies = [
    '{',
    '',
    'null',
    '[]',
    '{}',
    '{"title":null}',
    '{"title":42}',
    JSON.stringify({ title: '' }),
    JSON.stringify({ title: ' \n\t ' }),
    JSON.stringify({ title: 'a'.repeat(121) }),
  ];
  for (const body of bodies) {
    const response = await post(base, body);
    assert.equal(response.status, 400, `Must reject ${JSON.stringify(body)}`);
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.equal(typeof (await response.json()).error, 'string');
  }
  assert.deepEqual(await (await fetch(`${base}/api/notes`)).json(), { notes: [] });
});

test('accepts the 120-character title boundary', async (t) => {
  const base = await withServer(t);
  const title = 'a'.repeat(120);
  const response = await post(base, JSON.stringify({ title }));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).title, title);
});

test('accepts a valid body at 16KiB and rejects one byte more', async (t) => {
  const base = await withServer(t);
  const body = JSON.stringify({ title: 'Boundary' }).padEnd(16 * 1024, ' ');
  assert.equal((await post(base, body)).status, 201);
  const oversized = await post(base, body + ' ');
  assert.equal(oversized.status, 413);
  assert.equal(typeof (await oversized.json()).error, 'string');
  assert.equal((await (await fetch(`${base}/api/notes`)).json()).notes.length, 1);
});

test('enforces the byte limit for chunked Unicode bodies without Content-Length', async (t) => {
  const base = await withServer(t);
  const status = await new Promise((resolve, reject) => {
    const req = request(`${base}/api/notes`, { method: 'POST' }, (response) => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    req.on('error', reject);
    req.write('{"title":"');
    req.write('€'.repeat(6000));
    req.end('"}');
  });
  assert.equal(status, 413);
});

test('unknown paths and unsupported methods return 404', async (t) => {
  const base = await withServer(t);
  for (const [path, method] of [
    ['/missing', 'GET'],
    ['/api/notes/1', 'GET'],
    ['/api/notes', 'DELETE'],
    ['/', 'POST'],
  ]) {
    const response = await fetch(`${base}${path}`, { method });
    assert.equal(response.status, 404);
  }
});

test('notes belong to each server instance and are not persisted', async (t) => {
  const first = await withServer(t);
  await post(first, JSON.stringify({ title: 'Only first' }));
  const second = await withServer(t);
  assert.deepEqual(await (await fetch(`${second}/api/notes`)).json(), { notes: [] });
});

test('GET / serves the existing UI document', async (t) => {
  const base = await withServer(t);
  const expected = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const response = await fetch(`${base}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.equal(await response.text(), expected);
});
