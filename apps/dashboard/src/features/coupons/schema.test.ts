import assert from 'node:assert/strict';
import { CouponPatchSchema, CouponSchema, errorKey, fromDraft, instantOf, localOf, toDraft, zodErrors } from './schema.ts';
import { statusOf, type CouponInput } from './types.ts';

const coupon: CouponInput = {
  code: 'RAMADAN25', type: 'percent', value: 25, maxDiscountHalalas: 5000, minOrderHalalas: 10000, vendorIds: [], categoryIds: [],
  startsAt: '2026-11-30T21:00:00.000Z', endsAt: '2026-12-31T20:59:00.000Z', usageLimit: 500, perUserLimit: 1, isActive: true, firstOrderOnly: false,
};
const errors = (v: unknown) => {
  const r = CouponSchema.safeParse(v);
  return r.success ? {} : zodErrors(r.error);
};

// Riyadh times: midnight 1 December in Riyadh is 21:00 UTC the day before, and back.
assert.equal(instantOf('2026-12-01T00:00'), '2026-11-30T21:00:00.000Z');
assert.equal(localOf('2026-11-30T21:00:00.000Z'), '2026-12-01T00:00');
assert.equal(instantOf('2026-12-01'), '');

// The draft round-trips; amounts are SAR text ↔ halalas; percent stays a whole number.
const d = toDraft(coupon);
assert.equal(d.value, '25');
assert.equal(d.maxDiscountHalalas, '50.00');
assert.equal(d.startsAt, '2026-12-01T00:00');
assert.deepEqual(fromDraft(d), coupon);
assert.equal(fromDraft({ ...d, type: 'fixed', value: '٢٠٫٥' }).value, 2050);
assert.equal(fromDraft({ ...d, type: 'fixed' }).maxDiscountHalalas, null); // no cap on a fixed amount
assert.equal(fromDraft({ ...d, usageLimit: ' ', minOrderHalalas: '' }).usageLimit, null);

// The rules: percent 1–100, end after start, money in whole halalas, code shape; the code goes upper-case.
assert.deepEqual(errors(coupon), {});
assert.equal(CouponSchema.parse({ ...coupon, code: 'eid-10' }).code, 'EID-10');
assert.deepEqual(errors({ ...coupon, value: 101 }), { value: 'percent' });
assert.deepEqual(errors({ ...coupon, value: 0 }), { value: 'too_small' });
assert.deepEqual(errors({ ...coupon, type: 'fixed', value: 15000 }), {});
assert.deepEqual(errors({ ...coupon, type: 'fixed', value: 10.5 }), { value: 'invalid_type' });
assert.deepEqual(errors({ ...coupon, endsAt: coupon.startsAt }), { endsAt: 'endBeforeStart' });
assert.deepEqual(errors({ ...coupon, minOrderHalalas: 99.9 }), { minOrderHalalas: 'invalid_type' });
assert.deepEqual(errors({ ...coupon, code: 'a b' }), { code: 'invalid_format' });
assert.deepEqual(errors({ ...coupon, usageLimit: 0, vendorIds: ['x'] }), { usageLimit: 'too_small', 'vendorIds.0': 'invalid_format' });
assert.deepEqual(errors(fromDraft({ ...d, value: 'abc', endsAt: '' })), { value: 'invalid_type', endsAt: 'invalid_format' });
// A partial body checks only what it sends; deactivate is `isActive` alone.
assert.ok(CouponPatchSchema.safeParse({ isActive: false }).success);
assert.ok(!CouponPatchSchema.safeParse({ startsAt: coupon.endsAt, endsAt: coupon.startsAt }).success);

assert.equal(errorKey('value', 'too_small', 'percent'), 'percent');
assert.equal(errorKey('value', 'too_small', 'fixed'), 'amount');
assert.equal(errorKey('code', 'taken', 'fixed'), 'taken');
assert.equal(errorKey('perUserLimit', 'too_small', 'fixed'), 'limit');
assert.equal(errorKey('endsAt', 'endBeforeStart', 'fixed'), 'endBeforeStart');

// Status: inactive first, then the dates.
const at = (iso: string) => Date.parse(iso);
assert.equal(statusOf(coupon, at('2026-11-30T20:59:59Z')), 'scheduled');
assert.equal(statusOf(coupon, at('2026-12-10T00:00:00Z')), 'active');
assert.equal(statusOf(coupon, at('2026-12-31T20:59:00Z')), 'expired');
assert.equal(statusOf({ ...coupon, isActive: false }, at('2026-12-10T00:00:00Z')), 'inactive');
console.log('coupons schema: ok');
