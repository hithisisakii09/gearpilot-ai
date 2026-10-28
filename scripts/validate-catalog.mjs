import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const catalogFlag = args.indexOf('--catalog');
const catalogPath = catalogFlag >= 0 ? args[catalogFlag + 1] : null;
const dryRun = args.includes('--dry-run');

if (!catalogPath || !dryRun) {
  console.error('Usage: node scripts/validate-catalog.mjs --catalog <path> --dry-run');
  process.exit(1);
}

const resolvedPath = resolve(catalogPath);
const catalog = JSON.parse(await readFile(resolvedPath, 'utf8'));
const errors = [];
const productIds = new Set();
const offerIds = new Set();
if (!Array.isArray(catalog.products) || !Array.isArray(catalog.offers)) errors.push('Catalog must contain products and offers arrays.');
for (const product of catalog.products ?? []) {
  if (!product.id || productIds.has(product.id)) errors.push(`Invalid or duplicate product ID: ${product.id ?? '(missing)'}`);
  productIds.add(product.id);
  if (!['verified', 'partially_verified', 'unverified', 'demo'].includes(product.dataStatus)) errors.push(`Unsupported product verification status: ${product.id}`);
  if (product.specifications?.minHeightInches >= product.specifications?.maxHeightInches) errors.push(`Invalid height range: ${product.id}`);
}
for (const offer of catalog.offers ?? []) {
  if (!offer.id || offerIds.has(offer.id)) errors.push(`Invalid or duplicate offer ID: ${offer.id ?? '(missing)'}`);
  offerIds.add(offer.id);
  if (!productIds.has(offer.productId)) errors.push(`Offer references missing product: ${offer.id}`);
  if (offer.currency !== 'USD') errors.push(`Unsupported currency: ${offer.id}`);
  if (offer.priceCents !== null && (!Number.isInteger(offer.priceCents) || offer.priceCents < 0)) errors.push(`Invalid price: ${offer.id}`);
}
if (errors.length) {
  console.error(JSON.stringify({ dryRun: true, file: resolvedPath, valid: false, errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ dryRun: true, file: resolvedPath, valid: true, catalogStatus: catalog.catalogStatus, products: catalog.products.length, offers: catalog.offers.length }, null, 2));
