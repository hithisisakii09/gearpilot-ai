import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

export function buildProbeTargets(catalog, { limit = 8 } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error('Invalid limit');
  const seen = new Set();
  const targets = [];
  for (const p of catalog.products ?? []) {
    if (p.market !== 'US' || typeof p.officialManufacturerUrl !== 'string') continue;
    let u;
    try { u = new URL(p.officialManufacturerUrl); } catch { continue; }
    if (u.protocol !== 'https:' || u.port || u.username || u.password || u.search || u.hash || isIP(u.hostname) || !/^[a-z0-9.-]+$/.test(u.hostname) || !u.hostname.includes('.') || seen.has(u.href)) continue;
    seen.add(u.href);
    targets.push({ productId: p.id, url: u.href, hostname: u.hostname, market: p.market });
    if (targets.length >= limit) break;
  }
  return targets;
}

export function isPublicIp(ip) {
  if (isIP(ip) === 4) {
    const n = ip.split('.').map(Number);
    return !(n[0] === 0 || n[0] === 10 || n[0] === 127 || n[0] >= 224 || n[0] === 169 && n[1] === 254 || n[0] === 172 && n[1] >= 16 && n[1] <= 31 || n[0] === 192 && (n[1] === 168 || n[1] === 0 && n[2] === 0) || n[0] === 100 && n[1] >= 64 && n[1] <= 127 || n[0] === 198 && (n[1] === 18 || n[1] === 19) || n[0] === 192 && n[1] === 0 && n[2] === 2 || n[0] === 198 && n[1] === 51 && n[2] === 100 || n[0] === 203 && n[1] === 0 && n[2] === 113);
  }
  if (isIP(ip) === 6) return !(/^(::|::1$|f[cd]|fe[89ab]|2001:db8:|::ffff:)/i.test(ip));
  return false;
}

export async function probeTargets(targets, { resolver = lookup, fetcher = fetch } = {}) {
  const results = [];
  for (const target of targets) {
    try {
      const addresses = await resolver(target.hostname, { all: true, verbatim: true });
      if (!addresses.length || addresses.some(a => !isPublicIp(a.address))) throw new Error('DNS_NOT_PUBLIC');
      // The transport must independently pin/validate resolved IPs before this can be used against untrusted URLs.
      // Only pre-existing manufacturer catalog URLs are probed here; no submitted URLs are fetched.
      const response = await fetcher(target.url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(8000), headers: { 'user-agent': 'GearPilotResearchProbe/0.1 (+manual evidence verification)' } });
      results.push({ ...target, httpStatus: response.status, redirect: response.status >= 300 && response.status < 400, observedAt: new Date().toISOString(), status: 'unverified_probe_only', publicationAuthorized: false });
    } catch (e) {
      results.push({ ...target, error: String(e.message ?? e).slice(0, 120), observedAt: new Date().toISOString(), status: 'probe_failed', publicationAuthorized: false });
    }
  }
  return results;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const catalog = JSON.parse(readFileSync(new URL('../src/data/candidates.json', import.meta.url), 'utf8'));
  const targets = buildProbeTargets(catalog);
  const live = process.argv.includes('--live');
  const results = live ? await probeTargets(targets) : targets.map(t => ({ ...t, status: 'dry_run', publicationAuthorized: false }));
  const output = resolve('artifacts/primary-source-probes.json');
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify({ live, results, publicationAuthorized: false }, null, 2) + '\n');
  console.log(JSON.stringify({ live, targets: results.length, failures: results.filter(r => r.error).length, publicationAuthorized: false }));
}
