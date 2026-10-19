import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const page = await readFile(new URL('./public/index.html', import.meta.url));
const hostname = 'first-user-test.localhost';
const headers = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; connect-src 'none'; script-src 'none'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'",
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
};
export function createTestServer() {
  const server = createServer((request, response) => {
    if (request.headers.host !== `${hostname}:${server.address().port}`) {
      response.writeHead(403, headers).end(); return;
    }
    if ((request.method === 'GET' || request.method === 'HEAD') && request.url === '/') {
      response.writeHead(200, { ...headers, 'Content-Type': 'text/html; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : page); return;
    }
    // No SDK proxy, environment activation switch, body processing or credentials.
    // All non-page paths, including SDK files and report submission, remain closed.
    response.writeHead(404, { ...headers, 'Content-Type': 'application/json' });
    response.end(request.method === 'HEAD' ? undefined : JSON.stringify({ status: 'disabled' }));
  });
  server.headersTimeout = 5000; server.requestTimeout = 5000;
  server.timeout = 5000; server.keepAliveTimeout = 1000;
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createTestServer();
  server.on('error', error => { console.error(error.code ?? 'Local server failed'); process.exitCode = 1; });
  server.listen(4317, '127.0.0.1', () => console.log(`First User Test: http://${hostname}:4317 — reporting disabled`));
}
