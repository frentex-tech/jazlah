import assert from 'node:assert/strict';
import { errorKey, fromDraft, intOf, isDate, PageSchema, PausedSchema, toDraft, zodErrors } from './schema.ts';
import type { OperationsSettings } from './types.ts';

// An OperationsSettingsResponseDto (openapi.json).
const settings: OperationsSettings = {
  deliveryWindow: { start: '16:00', end: '18:00' },
  cutoffs: {
    readyMeat: { time: '14:00', leadDays: 0 },
    carcass: { time: '12:00', leadDays: 1 },
    cooked: { time: '10:00', leadDays: 1 },
    occasion: { time: null, leadDays: 3 },
    adha: { time: null, leadDays: 3 },
  },
  bookingHorizonDays: 7,
  closedDays: [{ date: '2026-12-04', scope: 'delivery', reasonAr: 'جرد', reasonEn: 'Stock count' }],
  defaultCapacity: { ordersPerDay: 120, carcassesPerDay: 40 },
  minOrderHalalas: 10000,
  deliveryFeeHalalas: 1550,
  cod: { enabled: true, maxOrderHalalas: null, allowedOrderTypes: ['carcass', 'adha'], confirmation: 'review' },
  paused: { isPaused: false, messageAr: null, messageEn: null },
  complaintWindowHours: 48,
  updatedAt: '2026-11-23T10:00:00.000Z',
};

// The draft round-trips to the PATCH body: amounts as SAR text, an empty COD maximum and cutoff time as null; never the
// pause or updatedAt.
const draft = toDraft(settings);
assert.equal(draft.minOrderHalalas, '100.00');
assert.equal(draft.cod.maxOrderHalalas, '');
assert.equal(draft.cutoffs.occasion.time, '');
const pageOf = ({ paused: _p, updatedAt: _u, ...rest }: OperationsSettings) => rest;
const page = pageOf(settings);
assert.deepEqual(fromDraft(draft), page);
assert.ok(!('paused' in draft) && !('updatedAt' in draft));
assert.ok(PageSchema.safeParse(page).success);
// adha and the other order types the page does not show are kept through a save.
assert.deepEqual(PageSchema.parse(fromDraft(draft)).cutoffs.adha, { time: null, leadDays: 3 });
assert.deepEqual(PageSchema.parse(fromDraft(draft)).cod.allowedOrderTypes, ['carcass', 'adha']);
// Arabic digits in a time are read as Latin.
assert.equal(fromDraft({ ...draft, deliveryWindow: { start: '١٦:٠٠', end: '18:00' } }).deliveryWindow.start, '16:00');
assert.ok(isDate('2028-02-29') && !isDate('2026-02-30') && !isDate('2026-13-01') && !isDate('26-1-1'));

// The validation frame (118:12848): a zero limit and «25:00» land on their own fields, with the API's paths.
const bad = fromDraft({ ...draft, defaultCapacity: { ...draft.defaultCapacity, ordersPerDay: '0' }, cutoffs: { ...draft.cutoffs, cooked: { time: '25:00', leadDays: '1' } } });
const errors = zodErrors(PageSchema.safeParse(bad).error!);
assert.equal(errorKey('defaultCapacity.ordersPerDay', errors['defaultCapacity.ordersPerDay']!), 'positive');
assert.equal(errorKey('cutoffs.cooked.time', errors['cutoffs.cooked.time']!), 'time');

// End must be after start.
assert.deepEqual(zodErrors(PageSchema.safeParse({ ...page, deliveryWindow: { start: '18:00', end: '16:00' } }).error!), { 'deliveryWindow.end': 'endBeforeStart' });

// The pause: messages required to pause, dropped on resume (SetOrderingPauseDto).
assert.deepEqual(PausedSchema.parse({ isPaused: false, messageAr: 'x', messageEn: 'y' }), { isPaused: false });
assert.ok(!PausedSchema.safeParse({ isPaused: true, messageAr: '', messageEn: 'y' }).success);
assert.deepEqual(Object.keys(zodErrors(PausedSchema.safeParse({ isPaused: true, messageAr: ' ', messageEn: 'ok' }).error!)), ['messageAr']);

// Typed numbers: Arabic digits accepted, anything else NaN (refused, not silently zero).
assert.equal(intOf('١٢٠'), 120);
assert.ok(Number.isNaN(intOf('')));
assert.ok(Number.isNaN(intOf('1.5')));
assert.equal(errorKey('closedDays.0.date', 'notPast'), 'notPast');
assert.equal(errorKey('closedDays.0.reasonAr', 'too_small'), 'reason');
assert.equal(errorKey('cod.maxOrderHalalas', 'too_small'), 'amount');
