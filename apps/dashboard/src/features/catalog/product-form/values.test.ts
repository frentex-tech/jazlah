import assert from 'node:assert/strict';
import type { Product } from '../types';
import { emptySize, priceChanges, stateOf, toValues } from './values.ts';

// A new product: required fields are reported on the API's paths.
const blank = stateOf(null);
let r = toValues({ ...blank, sizes: [{ ...emptySize(), tagAr: 'صغير' }] });
assert.deepEqual(Object.keys(r.errors).sort(), ['categoryId', 'name.ar', 'name.en', 'sizes.0.approxWeightGrams', 'sizes.0.priceHalalas', 'sizes.0.tag.en']);

// A filled form: SAR → halalas, a cut without a price is 0, both fulfilment switches → both.
r = toValues({
  ...blank, nameAr: 'ذبيحة نعيمي', nameEn: 'Naimi carcass', categoryId: 'c', images: [{ mediaId: 'm', url: null }],
  sizes: [{ ...emptySize(), grams: '8000', price: '950', tagAr: 'صغير', tagEn: 'Small' }],
  cuts: [{ id: 'k1', price: '' }, { id: 'k2', price: '15.5' }], packs: [{ packaging: 'vacuum', price: '0' }], exclusions: ['x'],
});
assert.deepEqual(r.errors, {});
assert.equal(r.values.fulfilment, 'both');
assert.deepEqual(r.values.content.sizes, [{ approxWeightGrams: 8000, priceHalalas: 95000, tag: { ar: 'صغير', en: 'Small' } }]);
assert.deepEqual(r.values.content.cuttings, [{ cuttingStyleId: 'k1', extraPriceHalalas: 0 }, { cuttingStyleId: 'k2', extraPriceHalalas: 1550 }]);
assert.equal(toValues({ ...blank, delivery: false, pickup: false }).errors.fulfilment, 'required');

// Price changes: only what the product already has and whose price moved.
const live = {
  sizes: [{ id: 's1', approxWeightGrams: 500, priceHalalas: 4500, tag: null }],
  cuttings: [{ cuttingStyleId: 'k1', name: null, extraPriceHalalas: 0 }],
  packagings: [{ packaging: 'trays', extraPriceHalalas: 300 }],
} as unknown as Product;
const content = {
  ...r.values.content,
  sizes: [{ id: 's1', approxWeightGrams: 500, priceHalalas: 5000 }, { approxWeightGrams: 1000, priceHalalas: 9000 }],
  cuttings: [{ cuttingStyleId: 'k1', extraPriceHalalas: 0 }],
  packagings: [{ packaging: 'trays' as const, extraPriceHalalas: 500 }],
};
assert.deepEqual(priceChanges(live, content), { sizes: [{ sizeId: 's1', priceHalalas: 5000 }], cuttings: [], packagings: [{ packaging: 'trays', extraPriceHalalas: 500 }] });
assert.equal(priceChanges(live, { ...content, sizes: [{ id: 's1', approxWeightGrams: 500, priceHalalas: 4500 }], packagings: [] }), null);
console.log('product-form values: ok');
