import assert from 'node:assert/strict';
import type { Product } from '../types';
import { bodyOf, differsForReview, editedContent, emptySize, liveContent, priceChanges, priceField, stateOf, toValues } from './values.ts';

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
assert.deepEqual(priceChanges(live, content), {
  body: { sizes: [{ sizeId: 's1', priceHalalas: 5000 }], cuttings: [], packagings: [{ packaging: 'trays', extraPriceHalalas: 500 }] },
  rows: { sizes: [0], cuttings: [], packagings: [0] },
});
// A refusal of the PATCH's first size lands on the form row it came from.
assert.equal(priceField('sizes.0.priceHalalas', { sizes: [2], cuttings: [], packagings: [] }), 'sizes.2.priceHalalas');
assert.equal(priceField('cuttings.0.cuttingStyleId', { sizes: [], cuttings: [3], packagings: [] }), 'cuttings.3.extraPriceHalalas');
assert.equal(priceField('sizes', { sizes: [], cuttings: [], packagings: [] }), 'sizes');
// Prices above the API's maximum are refused before the call.
assert.equal(toValues({ ...blank, sizes: [{ ...emptySize(), grams: '1', price: '1000000.01' }] }).errors['sizes.0.priceHalalas'], 'invalid');
assert.equal(toValues({ ...blank, cuts: [{ id: 'k', price: '1000000.01' }] }).errors['cuttings.0.extraPriceHalalas'], 'invalid');
assert.equal(priceChanges(live, { ...content, sizes: [{ id: 's1', approxWeightGrams: 500, priceHalalas: 4500 }], packagings: [] }), null);

// Review-sensitive edits of a published product: a moved price of an existing size is not one; a new size, a name or an image is.
const pub = {
  ...live, status: 'published', name: { ar: 'ريب آي', en: 'Ribeye' }, description: { ar: null, en: null }, category: { id: 'c', name: null }, meatType: null,
  images: [{ mediaId: 'm', url: 'u' }], exclusions: [], changeRequest: null,
} as unknown as Product;
const base = bodyOf(liveContent(pub));
assert.equal(differsForReview(pub, base, { ...base, sizes: [{ ...base.sizes[0]!, priceHalalas: 9900 }] }), false);
assert.equal(differsForReview(pub, base, { ...base, packagings: [{ packaging: 'trays', extraPriceHalalas: 0 }] }), false);
assert.equal(differsForReview(pub, base, { ...base, name: { ar: 'ريب آي طازج', en: 'Ribeye' } }), true);
assert.equal(differsForReview(pub, base, { ...base, imageMediaIds: [] }), true);
assert.equal(differsForReview(pub, base, { ...base, sizes: [...base.sizes, { approxWeightGrams: 900, priceHalalas: 100 }] }), true);
// The form opens on the pending edit, with the live prices of what the product has; the form's own body equals it.
const proposed = { ...liveContent(pub), name: { ar: 'ريب آي مقترح', en: 'Ribeye' }, sizes: [{ id: 's1', approxWeightGrams: 600, priceHalalas: 1, tag: null }] };
const withEdit = { ...pub, changeRequest: { status: 'pending', content: proposed } } as unknown as Product;
assert.equal(editedContent(withEdit).name.ar, 'ريب آي مقترح');
assert.deepEqual(editedContent(withEdit).sizes, [{ id: 's1', approxWeightGrams: 600, priceHalalas: 4500, tag: null }]);
assert.equal(stateOf(withEdit).nameAr, 'ريب آي مقترح');
assert.equal(stateOf({ ...withEdit, changeRequest: { status: 'rejected', content: proposed } } as unknown as Product).nameAr, 'ريب آي');
assert.equal(differsForReview(withEdit, bodyOf(editedContent(withEdit)), toValues(stateOf(withEdit)).values.content), false);
console.log('product-form values: ok');
