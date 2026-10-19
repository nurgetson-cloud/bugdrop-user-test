import { test } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { createTestServer } from '../server.mjs';
function send(port, path, method = 'GET', host = `first-user-test.localhost:${port}`) {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path, method, headers: { Host: host } }, res => {
      let body = ''; res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject); req.end(method === 'POST' ? '{"enabled":true}' : undefined);
  });
}
test('report paths stay closed despite activation-looking environment and inputs', async () => {
  const names = ['BUGDROP_ENABLED', 'DELIVERY_ENABLED', 'BUGDROP_INVITED_USERS_ENABLED'];
  const previous = names.map(name => process.env[name]);
  names.forEach(name => process.env[name] = '1');
  const oldFetch = globalThis.fetch; let outboundCalls = 0;
  globalThis.fetch = async () => { outboundCalls++; throw new Error('Unexpected outbound request'); };
  const server = createTestServer();
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port, home = await send(port, '/');
    assert.equal(home.status, 200); assert.match(home.body, /Feedback is disabled/);
    assert.match(home.body, /<button[^>]* disabled/);
    assert.doesNotMatch(home.body, /<script|<form|<iframe|<img/i);
    assert.match(home.headers['content-security-policy'], /connect-src 'none'; script-src 'none'/);
    for (const method of ['GET', 'POST', 'PUT', 'OPTIONS', 'HEAD']) {
      for (const path of ['/api/bugdrop-capability/v1', '/api/bugdrop-capability/v1?enabled=1', '/v1/submissions', '/sdk/src/server.ts', '/.env', '/../sdk/provenance.json']) {
        const result = await send(port, path, method);
        assert.equal(result.status, 404, `${method} ${path}`);
        assert.equal(result.headers['cache-control'], 'no-store');
        assert.equal(result.headers['access-control-allow-origin'], undefined);
      }
    }
    assert.equal((await send(port, '/', 'GET', 'untrusted.example')).status, 403);
    assert.equal((await send(port, '/', 'POST')).status, 404);
    assert.equal(outboundCalls, 0);
  } finally {
    await new Promise(resolve => server.close(resolve)); globalThis.fetch = oldFetch;
    names.forEach((name, i) => { if (previous[i] === undefined) delete process.env[name]; else process.env[name] = previous[i]; });
  }
});
