import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'downloaded');
const entries = await readdir(root, { withFileTypes: true });
const folders = entries.filter((entry) => entry.isDirectory() && entry.name.startsWith('gearpilot-private-staging-'));
assert.equal(folders.length, 1, 'Expected exactly one downloaded staging artifact');
const artifactRoot = path.join(root, folders[0].name);
const inventory = JSON.parse(await readFile(path.join(artifactRoot, 'staging-artifact-inventory.json'), 'utf8'));
assert.equal(inventory.buildMode, 'private-staging');
assert.match(inventory.gitSha, /^[a-f0-9]{40}$/);
assert.match(inventory.sourceBranchHeadSha, /^[a-f0-9]{40}$/);
assert.equal(inventory.remoteVerified, false, 'Do not claim remote verification');
assert.equal(inventory.deploymentId, null);
assert.ok(Array.isArray(inventory.paths) && inventory.paths.length >= 12);

async function listFiles(dir, prefix = '') {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) found.push(...await listFiles(path.join(dir, entry.name), rel));
    else {
      assert.ok(entry.isFile(), `Unexpected artifact entry: ${rel}`);
      found.push(rel);
    }
  }
  return found;
}
const dist = path.join(artifactRoot, 'dist');
const actual = (await listFiles(dist)).sort();
const expected = inventory.paths.map((item) => item.path).sort();
assert.deepEqual(actual, expected, 'Artifact files differ from inventory');
for (const item of inventory.paths) {
  assert.ok(!item.path.startsWith('/') && !item.path.split('/').includes('..'), 'Unsafe file path');
  const file = path.join(dist, item.path);
  const body = await readFile(file);
  assert.equal(body.byteLength, item.bytes, `Size mismatch: ${item.path}`);
  assert.equal(createHash('sha256').update(body).digest('hex'), item.sha256, `Hash mismatch: ${item.path}`);
}
const headers = await readFile(path.join(dist, '_headers'), 'utf8');
assert.match(headers, /X-Robots-Tag:\s*noindex, nofollow, noarchive/i);
assert.match(headers, /Content-Security-Policy:/i);
const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
assert.match(robots, /Disallow:\s*\//i);
const index = await readFile(path.join(dist, 'index.html'), 'utf8');
assert.match(index, /noindex/i);
console.log(JSON.stringify({ status: 'LOCAL_PREFLIGHT_PASS', files: actual.length, buildCommit: inventory.gitSha, sourceCommit: inventory.sourceBranchHeadSha, remoteVerified: false }));
