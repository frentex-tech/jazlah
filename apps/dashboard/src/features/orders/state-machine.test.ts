import assert from 'node:assert/strict';
import { awaitsCodReview, canReschedule, canTransition, nextStatuses } from './state-machine.ts';
import { STATUSES } from './types.ts';

const d = (status: (typeof STATUSES)[number]) => ({ status, fulfilment: 'delivery' as const });
const p = (status: (typeof STATUSES)[number]) => ({ status, fulfilment: 'pickup' as const });

assert.deepEqual(nextStatuses(d('confirmed'), 'vendor'), ['preparing']);
assert.deepEqual(nextStatuses(d('confirmed'), 'admin'), ['preparing', 'cancelled']);
assert.deepEqual(nextStatuses(d('ready'), 'vendor'), [], 'a delivery order leaves the vendor with the driver');
assert.deepEqual(nextStatuses(p('ready'), 'vendor'), ['collected']);
assert.deepEqual(nextStatuses(d('ready'), 'admin'), ['picked_up', 'cancelled']);
assert.deepEqual(nextStatuses(d('new'), 'vendor'), [], 'only admins review COD');
assert.ok(canTransition(d('new'), 'confirmed', 'admin'));
assert.ok(!canTransition(d('delivered'), 'cancelled', 'admin'));
assert.ok(!canTransition(d('out_for_delivery'), 'cancelled', 'admin'));
for (const s of ['delivered', 'collected', 'cancelled', 'returned'] as const) assert.deepEqual(nextStatuses(d(s), 'admin'), [], `${s} is final`);
for (const s of STATUSES) assert.deepEqual(nextStatuses(d(s), 'customer').filter((t) => t !== 'cancelled'), [], 'customers only cancel');
assert.ok(canReschedule('preparing') && !canReschedule('out_for_delivery'));
assert.ok(awaitsCodReview({ status: 'new', paymentMethod: 'cod' }) && !awaitsCodReview({ status: 'new', paymentMethod: 'wallet' }));
