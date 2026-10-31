import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function auditGlobalMarkets(registry, catalog) {
  const findings = [];
  const countries = new Set();
  for (const market of registry.markets ?? []) {
    if (!/^[A-Z]{2}$/.test(market.country) || !/^[A-Z]{3}$/.test(market.currency) || !market.language || countries.has(market.country)) findings.push({ code: 'INVALID_MARKET', country: market.country });
    countries.add(market.country);
  }
  for (const product of catalog.products ?? []) {
    if (!countries.has(product.market)) findings.push({ code: 'UNREGISTERED_MARKET', productId: product.id, country: product.market });
  }
  for (const offer of catalog.offers ?? []) {
    if (offer.market && !countries.has(offer.market)) findings.push({ code: 'UNREGISTERED_OFFER_MARKET', offerId: offer.id, country: offer.market });
  }
  return { researchMarkets: countries.size, existingCatalogProducts: (catalog.products ?? []).length, findings, publicationAuthorized: false };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const registry = JSON.parse(readFileSync(new URL('../config/global-markets.json', import.meta.url), 'utf8'));
  const catalog = JSON.parse(readFileSync(new URL('../src/data/candidates.json', import.meta.url), 'utf8'));
  console.log(JSON.stringify(auditGlobalMarkets(registry, catalog), null, 2));
}
