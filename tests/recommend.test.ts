import { describe,it,expect } from 'vitest';
import demo from '../src/data/demo.json';
import { ProductSchema, OfferSchema } from '../src/lib/schema';
import { recommend } from '../src/lib/recommend';
const products=demo.products.map(p=>ProductSchema.parse(p));
const offers=demo.offers.map(o=>OfferSchema.parse(o));
const criteria={budgetCents:50000,minWidthInches:48,electricRequired:true,preference:'value' as const,market:'US' as const};
describe('recommendation engine',()=>{
 it('filters by electric requirement and width',()=>{const r=recommend(products,offers,criteria);expect(r).toHaveLength(2);expect(r.every(x=>x.product.electric && x.product.widthInches!>=48)).toBe(true)});
 it('excludes offers exceeding landed budget',()=>{expect(recommend(products,offers.map(o=>o.productId==='demo-a'?{...o,mandatoryShippingCents:20000}:o),criteria).map(x=>x.product.id)).not.toContain('demo-a')});
 it('does not depend on affiliate URL',()=>{const a=recommend(products,offers,criteria);const b=recommend(products,offers.map(o=>({...o,affiliateUrl:'https://example.com/affiliate'})),criteria);expect(a.map(x=>[x.product.id,x.score])).toEqual(b.map(x=>[x.product.id,x.score]))});
 it('does not treat unknown shipping as free',()=>{const r=recommend(products,offers.map(o=>({...o,mandatoryShippingCents:null})),criteria);expect(r).toHaveLength(0)});
 it('produces deterministic results',()=>{expect(recommend(products,offers,criteria)).toEqual(recommend(products,offers,criteria))});
});
