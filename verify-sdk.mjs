import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = new URL('./sdk/', import.meta.url);
const provenance = JSON.parse(await readFile(new URL('provenance.json', root)));
assert.equal(provenance.sourceCommit, 'cfac363ac8a3dae42ddd739977ed2f7f8310d5b3');
for (const [path, expected] of Object.entries(provenance.sha256)) {
  assert(!path.startsWith('/') && !path.split('/').includes('..'));
  assert.equal(createHash('sha256').update(await readFile(new URL(path, root))).digest('hex'), expected, path);
}
console.log('Pinned SDK package and example hashes verified; SDK is not mounted.');
