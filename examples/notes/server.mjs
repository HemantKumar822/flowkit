import { createServer as httpCreateServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const BODY_LIMIT = 16 * 1024;

function json(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

export function createServer() {
  const notes = [];
  return httpCreateServer(async (request, response) => {
    const path = new URL(request.url, 'http://127.0.0.1').pathname;

    if (request.method === 'GET' && path === '/') {
      try {
        const html = await readFile(new URL('./index.html', import.meta.url));
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        response.end(html);
      } catch {
        json(response, 500, { error: 'The notes page is unavailable.' });
      }
      return;
    }

    if (request.method === 'GET' && path === '/api/notes') {
      json(response, 200, { notes });
      return;
    }

    if (request.method !== 'POST' || path !== '/api/notes') {
      request.resume();
      json(response, 404, { error: 'Not found.' });
      return;
    }

    let bytes = 0;
    let chunks = [];
    let rejected = false;
    request.on('data', (chunk) => {
      if (rejected) return;
      bytes += chunk.length;
      if (bytes > BODY_LIMIT) {
        rejected = true;
        chunks = [];
        json(response, 413, { error: 'Request body exceeds 16 KiB.' });
        return;
      }
      chunks.push(chunk);
    });
    request.on('error', () => {
      if (!response.headersSent) json(response, 400, { error: 'Invalid request body.' });
    });
    request.on('end', () => {
      if (rejected) return;
      let data;
      try {
        data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        json(response, 400, { error: 'Body must be valid JSON.' });
        return;
      }
      const title = data?.title;
      if (typeof title !== 'string' || !title.trim() || title.length > 120) {
        json(response, 400, { error: 'Title must contain 1–120 characters.' });
        return;
      }
      const note = { id: randomUUID(), title: title.trim() };
      notes.push(note);
      json(response, 201, note);
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  createServer().listen(4179, '127.0.0.1', () => {
    console.log('Notes available at http://127.0.0.1:4179');
  });
}
