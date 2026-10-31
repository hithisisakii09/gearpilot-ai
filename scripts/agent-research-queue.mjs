import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

export function planResearch(registry, catalog, { date = new Date().toISOString().slice(0, 10), batchSize = 12 } = {}) {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) throw new Error('Invalid date');
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 100) throw new Error('Invalid batchSize');
  const markets = registry.markets ?? [];
  if (!markets.length) return [];
  const categories = ['standing_desk', 'ergonomic_chair', 'monitor_arm', 'docking_station'];
  const existing = new Map();
  for (const product of catalog.products ?? []) {
    const key = [product.market, product.category].join(':');
    existing.set(key, (existing.get(key) ?? 0) + 1);
  }
  const days = Math.floor(Date.parse(date + 'T00:00:00Z') / 86400000);
  const tasks = [];
  for (let i = 0; i < batchSize; i++) {
    const market = markets[(days + i) % markets.length];
    const category = categories[(Math.floor((days + i) / markets.length) + i) % categories.length];
    tasks.push({ id: date + ':' + market.country + ':' + category, date, country: market.country, currency: market.currency, language: market.language, category, knownCatalogProducts: existing.get(market.country + ':' + category) ?? 0, status: 'pending_primary_source_research', publicationAuthorized: false });
  }
  return tasks;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const registry = JSON.parse(readFileSync(new URL('../config/global-markets.json', import.meta.url), 'utf8'));
  const catalog = JSON.parse(readFileSync(new URL('../src/data/candidates.json', import.meta.url), 'utf8'));
  const date = process.env.RESEARCH_DATE ?? new Date().toISOString().slice(0, 10);
  const tasks = planResearch(registry, catalog, { date });
  const output = resolve('artifacts/research-queue-' + date + '.json');
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify({ generatedAt: new Date().toISOString(), researchOnly: true, tasks }, null, 2) + '\n');
  console.log(JSON.stringify({ output, tasks: tasks.length, countries: new Set(tasks.map(t => t.country)).size, publicationAuthorized: false }));
}
