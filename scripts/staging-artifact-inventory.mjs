import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../dist/', import.meta.url);
const paths = [
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
  manifest.paths.push({ path, bytes: body.byteLength });
}
assert.ok(manifest.paths.every((item) => item.bytes > 0));
console.log(JSON.stringify(manifest, null, 2));
console.error('LOCAL ARTIFACT INVENTORY ONLY: remote headers, Access, deployed SHA and rollback are not verified.');
