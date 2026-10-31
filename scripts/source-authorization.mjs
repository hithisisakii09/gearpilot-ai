import { isIP } from 'node:net';

export function normalizeAuthorizedSource(raw) {
  if (typeof raw !== 'string') return null;
  let u;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== 'https:' || u.username || u.password || u.port || u.search || u.hash || isIP(u.hostname)) return null;
  if (!/^[a-z0-9.-]+$/.test(u.hostname) || !u.hostname.includes('.') || u.hostname.endsWith('.local') || u.hostname.endsWith('.internal') || u.hostname === 'localhost') return null;
  return { url: u.href, hostname: u.hostname };
}

export function createAuthorizedSourceManifest(catalog) {
  const seen = new Set();
  const sources = [];
  for (const product of catalog.products ?? []) {
    const normalized = normalizeAuthorizedSource(product.officialManufacturerUrl);
    if (!normalized) continue;
    const key = product.market + ':' + normalized.url;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({ country: product.market, productId: product.id, ...normalized, authorizationStatus: 'not_verified', liveFetchAllowed: false, publicationAuthorized: false });
  }
  return { researchOnly: true, sources };
}

export function auditSourceManifest(manifest) {
  const findings = [];
  const keys = new Set();
  for (const [index, source] of (manifest.sources ?? []).entries()) {
    const normalized = normalizeAuthorizedSource(source.url);
    if (!normalized || normalized.hostname !== source.hostname) findings.push({ index, code: 'INVALID_SOURCE' });
    const key = source.country + ':' + source.url;
    if (keys.has(key)) findings.push({ index, code: 'DUPLICATE_SOURCE' });
    keys.add(key);
    if (source.liveFetchAllowed !== false || source.publicationAuthorized !== false || source.authorizationStatus !== 'not_verified') findings.push({ index, code: 'UNAUTHORIZED_STATE' });
  }
  return { valid: findings.length === 0, sources: (manifest.sources ?? []).length, findings };
}
