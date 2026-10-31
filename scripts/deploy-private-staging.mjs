// Exact-artifact staging deployment. Default mode is read-only; never targets production.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, lstat } from 'node:fs/promises';
import path from 'node:path';

const WORKER = 'gearpilot-ai-private-staging';
const HOST = 'https://gearpilot-ai-private-staging.hithisisakii09.workers.dev';
const mode = process.argv[2] ?? '--plan';
const artifactDir = path.resolve(process.argv[3] ?? 'preflight-input/gearpilot-private-staging-local');
assert.ok(['--plan', '--apply'].includes(mode), 'Usage: --plan|--apply [artifact-directory]');
const inventory = JSON.parse(await readFile(path.join(artifactDir, 'staging-artifact-inventory.json'), 'utf8'));
assert.equal(inventory.buildMode, 'private-staging');
assert.match(inventory.gitSha, /^[a-f0-9]{40}$/);
assert.match(inventory.sourceBranchHeadSha, /^[a-f0-9]{40}$/);
assert.equal(inventory.remoteVerified, false);
assert.equal(inventory.deploymentId, null);
assert.equal(inventory.deploymentUrl, null);
assert.ok(Array.isArray(inventory.paths) && inventory.paths.length >= 12);
const dist = path.join(artifactDir, 'dist');
async function walk(directory, prefix = '') {
  const names = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    const full = path.join(directory, entry.name);
    const stat = await lstat(full);
    assert.ok(!stat.isSymbolicLink(), 'Symlink in staging artifact: ' + relative);
    if (stat.isDirectory()) names.push(...await walk(full, relative));
    else { assert.ok(stat.isFile(), 'Unsupported build entry: ' + relative); names.push(relative); }
  }
  return names;
}
const actualPaths = (await walk(dist)).sort();
const expectedPaths = inventory.paths.map(e => e.path).sort();
assert.deepEqual(actualPaths, expectedPaths, 'Missing, unexpected or duplicated files');
const assetManifest = {};
const assetFiles = new Map();
for (const item of inventory.paths) {
  assert.ok(typeof item.path === 'string' && !item.path.startsWith('/') && !item.path.includes('\\') && !item.path.split('/').includes('..'), 'Unsafe artifact path');
  const contents = await readFile(path.join(dist, item.path));
  const digest = createHash('sha256').update(contents).digest('hex');
  assert.equal(contents.length, item.bytes, 'Byte length mismatch: ' + item.path);
  assert.equal(digest, item.sha256, 'SHA-256 mismatch: ' + item.path);
  const hash = digest.slice(0, 32);
  assert.ok(!assetFiles.has(hash), 'Truncated hash collision in asset manifest');
  const mime = item.path.endsWith('.html') ? 'text/html; charset=utf-8' :
    item.path.endsWith('.js') ? 'text/javascript; charset=utf-8' :
    item.path.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8';
  assetManifest['/' + item.path] = { hash, size: contents.length };
  assetFiles.set(hash, { contents, mime });
}
for (const required of ['index.html', '404.html', 'robots.txt', '_headers', 'sitemap.xml']) {
  assert.ok(actualPaths.includes(required), 'Required staging file missing: ' + required);
}
const headersFile = await readFile(path.join(dist, '_headers'), 'utf8');
assert.match(headersFile, /X-Robots-Tag:\s*noindex, nofollow, noarchive/i);
assert.match(headersFile, /Content-Security-Policy:/i);
assert.match((await readFile(path.join(dist, 'robots.txt'), 'utf8')), /Disallow:\s*\//);
assert.match((await readFile(path.join(dist, 'index.html'), 'utf8')), /noindex/i);

const plan = { mode, target: WORKER, sourceCommit: inventory.sourceBranchHeadSha,
  buildCommit: inventory.gitSha, fileCount: actualPaths.length, bytes: inventory.paths.reduce((n, x) => n + x.bytes, 0),
  hashMethod: 'first 16 bytes of SHA-256', publicProductionTouched: false };
if (mode === '--plan') {
  console.log(JSON.stringify({ status: 'LOCAL_STAGING_DEPLOY_PLAN_PASS', ...plan }, null, 2));
  process.exit(0);
}

// Required human-approved staging-only invocation; no credentials or identity are embedded in this repo.
assert.equal(process.env.GEARPILOT_STAGING_DEPLOY_APPROVAL, 'ISOLATED_STAGING_ONLY');
assert.equal(process.env.GEARPILOT_EXPECTED_SOURCE_SHA, inventory.sourceBranchHeadSha);
assert.equal(process.env.GEARPILOT_EXPECTED_BUILD_SHA, inventory.gitSha);
assert.equal(path.basename(artifactDir), 'gearpilot-private-staging-' + inventory.gitSha,
  'Only deploy an unmodified, specifically named GitHub CI artifact');
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const accessAppId = process.env.GEARPILOT_STAGING_ACCESS_APP_ID;
const workerId = process.env.GEARPILOT_STAGING_WORKER_ID;
const ownerEmail = process.env.GEARPILOT_STAGING_OWNER_EMAIL;
for (const [key, value] of Object.entries({ account, token, accessAppId, workerId, ownerEmail })) {
  assert.ok(value, 'Missing deployment-only secret/environment configuration: ' + key);
}
const origin = 'https://api.cloudflare.com/client/v4';
async function api(method, uri, body, auth = token, form = false) {
  const options = { method, headers: { Authorization: 'Bearer ' + auth } };
  if (body !== undefined) {
    if (form) options.body = body;
    else { options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(body); }
  }
  const res = await fetch(origin + uri, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success !== true) {
    throw new Error('Cloudflare API failed (' + res.status + ') on ' + method + ' ' + uri.replace(account, '[account]') +
      ': ' + JSON.stringify(data.errors ?? []).slice(0, 400));
  }
  return data.result;
}
const prefix = '/accounts/' + encodeURIComponent(account);
function assertAccess(app) {
  assert.equal(app.type, 'self_hosted');
  assert.deepEqual(app.destinations, [{ type: 'worker', worker_id: workerId }],
    'Access application must point only to isolated staging Worker');
  assert.ok(Array.isArray(app.policies) && app.policies.length === 1,
    'Must have exactly one narrow Access policy');
  const policy = app.policies[0];
  assert.equal(policy.decision, 'allow', 'Bypass and public policies forbidden');
  assert.deepEqual(policy.include, [{ email: { email: ownerEmail } }]);
  assert.equal((policy.require ?? []).length, 0);
  assert.equal((policy.exclude ?? []).length, 0);
}
async function checkProtection() {
  const app = await api('GET', prefix + '/access/apps/' + encodeURIComponent(accessAppId));
  assertAccess(app);
  const subdomain = await api('GET', prefix + '/workers/scripts/' + WORKER + '/subdomain');
  assert.equal(subdomain.enabled, true);
  assert.equal(subdomain.previews_enabled, false);
}
async function currentDeployment() {
  const result = await api('GET', prefix + '/workers/scripts/' + WORKER + '/deployments');
  assert.ok(result.deployments?.length, 'Staging Worker must have a rollback deployment');
  const latest = result.deployments[0];
  assert.ok(latest.id && latest.versions?.length === 1);
  assert.equal(latest.versions[0].percentage, 100);
  return latest;
}
await checkProtection();
const previous = await currentDeployment();
console.log(JSON.stringify({ status: 'STAGING_PREDEPLOY_GATES_PASS', ...plan, previousDeploymentId: previous.id }));
// Never touch production: uploads/session/version/deployment all address the literal isolated staging Worker.
const session = await api('POST', prefix + '/workers/scripts/' + WORKER + '/assets-upload-session',
  { manifest: assetManifest });
assert.ok(session.jwt && Array.isArray(session.buckets), 'Invalid asset upload session');
let completion = session.jwt;
for (const bucket of session.buckets) {
  const form = new FormData();
  for (const hash of bucket) {
    const asset = assetFiles.get(hash);
    assert.ok(asset, 'Unknown hash requested in Cloudflare upload bucket');
    form.append(hash, new Blob([asset.contents.toString('base64')], { type: asset.mime }), hash);
  }
  const result = await api('POST', prefix + '/workers/assets/upload?base64=true', form, session.jwt, true);
  if (result?.jwt) completion = result.jwt;
}
assert.ok(completion, 'No completed asset upload token');
assert.ok(session.buckets.length === 0 || completion !== session.jwt,
  'Asset upload incomplete: Cloudflare did not return a completion token');
const moduleSource = "export default { async fetch(request, env) { let response; try { response = await env.ASSETS.fetch(request); } catch { response = new Response('Staging temporarily unavailable', { status: 503 }); } const headers = new Headers(response.headers); headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive'); headers.set('Cache-Control', 'private, no-store'); return new Response(response.body, { status: response.status, statusText: response.statusText, headers }); } };";
const metadata = {
  main_module: 'staging.mjs', compatibility_date: '2026-10-01',
  bindings: [{ type: 'assets', name: 'ASSETS' }],
  assets: { jwt: completion, config: {
    _headers: headersFile, html_handling: 'auto-trailing-slash',
    not_found_handling: '404-page', run_worker_first: true } },
  annotations: {
    'workers/commit_sha': inventory.sourceBranchHeadSha,
    'workers/message': 'Private staging verified CI build ' + inventory.gitSha,
    'workers/repository_url': 'https://github.com/hithisisakii09/gearpilot-ai' }
};
const upload = new FormData();
upload.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata.json');
upload.append('staging.mjs', new Blob([moduleSource], { type: 'application/javascript+module' }), 'staging.mjs');
const version = await api('POST', prefix + '/workers/scripts/' + WORKER + '/versions', upload, token, true);
assert.ok(version.id, 'Cloudflare did not supply a version ID');
await checkProtection();
assert.equal((await currentDeployment()).id, previous.id, 'Staging changed during the upload; aborting deployment');
const deployed = await api('POST', prefix + '/workers/scripts/' + WORKER + '/deployments', {
  strategy: 'percentage',
  versions: [{ version_id: version.id, percentage: 100 }],
  annotations: { 'workers/message': 'Isolated private staging ' + inventory.gitSha }
});
assert.ok(deployed.id, 'Cloudflare did not return a deployment ID');
async function verifyAnonymousDenial() {
  for (const route of ['/', '/robots.txt', '/sitemap.xml', '/about/', '/nonexistent-asset-probe']) {
    const response = await fetch(HOST + route, { redirect: 'manual', signal: AbortSignal.timeout(12000) });
    const redirectTo = response.headers.get('location') ?? '';
    const blocked = response.status === 401 || response.status === 403 ||
      ([302, 303, 307, 308].includes(response.status) && /cloudflareaccess\.com|\/cdn-cgi\/access/i.test(redirectTo));
    assert.ok(blocked, 'Anonymous staging request was not blocked for ' + route + ' (status ' + response.status + ')');
  }
}
try {
  await checkProtection();
  await verifyAnonymousDenial();
} catch (failure) {
  try {
    await api('POST', prefix + '/workers/scripts/' + WORKER + '/deployments', {
      strategy: 'percentage',
      versions: [{ version_id: previous.versions[0].version_id, percentage: 100 }],
      annotations: { 'workers/message': 'Automatic private staging rollback after security check failure' }
    });
  } catch (rollbackError) {
    throw new Error('CRITICAL: staging security verification failed and rollback also failed: ' +
      String(failure.message) + '; rollback: ' + String(rollbackError.message));
  }
  throw new Error('Private staging was rolled back: ' + String(failure.message));
}
console.log(JSON.stringify({ status: 'STAGING_DEPLOYED_PENDING_REMOTE_UAT', deploymentId: deployed.id,
  workerVersionId: version.id, rollbackVersionId: previous.versions[0].version_id,
  sourceCommit: inventory.sourceBranchHeadSha, buildCommit: inventory.gitSha, host: HOST }));
// Preserve the previous version as a rollback target. Authenticated UAT and independent review remain mandatory.
