import { describe, it, expect } from 'vitest';
import { buildProbeTargets, isPublicIp, probeTargets } from './primary-source-probe.mjs';
const catalog = { products: [{ id: 'a', market: 'US', officialManufacturerUrl: 'https://example.com/desk' }, { id: 'b', market: 'IN', officialManufacturerUrl: 'https://example.in/desk' }, { id: 'c', market: 'US', officialManufacturerUrl: 'http://example.com/desk' }] };
describe('manufacturer source probe', () => {
  it('only selects deduplicated HTTPS US catalog URLs', () => expect(buildProbeTargets(catalog)).toEqual([{ productId: 'a', url: 'https://example.com/desk', hostname: 'example.com', market: 'US' }]));
  it('rejects private and reserved IPs', () => { expect(isPublicIp('127.0.0.1')).toBe(false); expect(isPublicIp('10.0.0.1')).toBe(false); expect(isPublicIp('192.168.1.2')).toBe(false); expect(isPublicIp('8.8.8.8')).toBe(true); });
  it('does not follow redirects or approve evidence', async () => { const fetcher = async (_, opts) => { expect(opts.redirect).toBe('manual'); return { status: 302 }; }; const result = await probeTargets(buildProbeTargets(catalog), { resolver: async () => [{ address: '8.8.8.8' }], fetcher }); expect(result[0]).toMatchObject({ redirect: true, publicationAuthorized: false, status: 'unverified_probe_only' }); });
  it('blocks private DNS before network access', async () => { const fetcher = () => { throw Error('must not fetch'); }; const result = await probeTargets(buildProbeTargets(catalog), { resolver: async () => [{ address: '127.0.0.1' }], fetcher }); expect(result[0].error).toBe('DNS_NOT_PUBLIC'); });
});
