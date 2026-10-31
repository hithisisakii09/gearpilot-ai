import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../dist/', import.meta.url);
const requiredPaths = [
  'index.html',
  'about/index.html',
  'methodology/index.html',
  'affiliate-disclosure/index.html',
  'privacy/index.html',
  'contact/index.html',
  'guides/standing-desk-fit/index.html',
  'robots.txt',
  'sitemap.xml',
];
async function collectFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = `${prefix}${entry.name}`;
    if (entry.isDirectory()) files.push(...await collectFiles(new URL(`${path}/`, root), `${path}/`));
    else {
      assert.ok(entry.isFile(), `Unexpected non-file in build: ${path}`);
      files.push(path);
    }
  }
  return files;
}
const paths = (await collectFiles(root)).sort();
for (const required of requiredPaths) assert.ok(paths.includes(required), `Missing required build file: ${required}`);
assert.ok(paths.includes('_headers'), 'Missing staging security headers configuration');
assert.ok(paths.includes('404.html'), 'Missing 404 page');
const manifest = {
  schemaVersion: 1,
  buildMode: 'private-staging',
  generatedAt: new Date().toISOString(),
  gitSha: process.env.GITHUB_SHA ?? null,
  deploymentId: null,
  deploymentUrl: null,
  remoteVerified: false,
  paths: [],
};
for (const path of paths) {
  const body = await readFile(new URL(path, root));
  manifest.paths.push({ path, bytes: body.byteLength, sha256: createHash('sha256').update(body).digest('hex') });
}
assert.ok(manifest.paths.every((item) => item.bytes > 0 && /^[a-f0-9]{64}$/.test(item.sha256)));
if (manifest.gitSha !== null) assert.match(manifest.gitSha, /^[a-f0-9]{40}$/, 'CI Git SHA must be a full commit hash');
console.log(JSON.stringify(manifest, null, 2));
console.error('LOCAL ARTIFACT INVENTORY ONLY: remote headers, Access, deployed SHA and rollback are not verified.');
