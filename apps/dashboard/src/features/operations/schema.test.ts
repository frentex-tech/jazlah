import assert from 'node:assert/strict';
import { errorKey, fromDraft, intOf, OperationsSchema, toDraft, zodErrors } from './schema.ts';
import type { OperationsSettings } from './types.ts';

const settings: OperationsSettings = {
  deliveryWindow: { start: '16:00', end: '18:00' },
  cutoffs: { ready_meat: { time: '14:00', leadDays: 0 }, carcass: { time: '12:00', leadDays: 1 }, cooked: { time: '10:00', leadDays: 1 }, occasion: { time: '09:00', leadDays: 3 } },
  bookingHorizonDays: 7,
  closedDays: [{ date: '2026-12-04', scope: 'delivery', reasonAr: 'جرد', reasonEn: 'Stock count' }],
  capacity: { ordersPerDay: 120, carcassesPerDay: 40 },
  minOrderHalalas: 10000,
  deliveryFeeHalalas: 1550,
  cod: { enabled: true, maxOrderHalalas: null, allowedOrderTypes: ['carcass'], confirmation: 'review' },
  paused: { isPaused: false, messageAr: 'متوقفة', messageEn: 'Paused' },
  complaintWindowHours: 48,
  workingHours: (['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as const).map((day) => ({ day, open: day !== 'fri', start: '08:00', end: '22:00' })),
};

// The draft round-trips: amounts as SAR text, an empty COD maximum as null.
const draft = toDraft(settings);
assert.equal(draft.minOrderHalalas, '100.00');
assert.equal(draft.cod.maxOrderHalalas, '');
assert.deepEqual(fromDraft(draft), settings);
assert.ok(OperationsSchema.safeParse(settings).success);

// The validation frame (118:12848): a zero limit and «25:00» land on their own fields, with the API's paths.
const bad = fromDraft({ ...draft, capacity: { ...draft.capacity, ordersPerDay: '0' }, cutoffs: { ...draft.cutoffs, cooked: { time: '25:00', leadDays: '1' } } });
const errors = zodErrors(OperationsSchema.safeParse(bad).error!);
assert.equal(errorKey('capacity.ordersPerDay', errors['capacity.ordersPerDay']!), 'positive');
assert.equal(errorKey('cutoffs.cooked.time', errors['cutoffs.cooked.time']!), 'time');

// End must be after start (window and open days); a closed day's hours are not checked.
const window = zodErrors(OperationsSchema.safeParse({ ...settings, deliveryWindow: { start: '18:00', end: '16:00' } }).error!);
assert.deepEqual(window, { 'deliveryWindow.end': 'endBeforeStart' });
const hours = settings.workingHours.map((h) => ({ ...h, start: '23:00', end: '08:00' }));
assert.deepEqual(Object.keys(zodErrors(OperationsSchema.safeParse({ ...settings, workingHours: hours }).error!)).sort(), ['0', '1', '2', '3', '4', '5'].map((i) => `workingHours.${i}.end`));

// Typed numbers: Arabic digits accepted, anything else NaN (refused, not silently zero).
assert.equal(intOf('١٢٠'), 120);
assert.ok(Number.isNaN(intOf('')));
assert.ok(Number.isNaN(intOf('1.5')));
assert.equal(errorKey('closedDays.0.date', 'notPast'), 'notPast');
assert.equal(errorKey('closedDays.0.reasonAr', 'too_small'), 'reason');
assert.equal(errorKey('cod.maxOrderHalalas', 'too_small'), 'amount');
