// The in-process mock of backend.ts (DASHBOARD_API_MOCK=1): loaded only through lib/mock-backends.ts, so a production
// build leaves it out. Seeds follow 118:11181; an admin access token ending in «-limited» is answered NOT_ALLOWED
// (118:13416), as in the other admin mocks.
import type { ApiResult } from '@/lib/auth/panel-session';
import { addDays, riyadhToday } from '@/lib/date';
import type { OperationsBackend } from './backend';
import { OperationsSchema } from './schema';
import type { OperationsSettings, VendorCapacity } from './types';

function seed(): OperationsSettings {
  const today = riyadhToday();
  const fridays = [0, 1, 2, 3, 4, 5, 6].map((n) => addDays(today, n)).filter((d) => new Date(`${d}T00:00:00Z`).getUTCDay() === 5);
  return {
    deliveryWindow: { start: '16:00', end: '18:00' },
    cutoffs: {
      ready_meat: { time: '14:00', leadDays: 0 },
      carcass: { time: '12:00', leadDays: 1 },
      cooked: { time: '10:00', leadDays: 1 },
      occasion: { time: '09:00', leadDays: 3 },
    },
    bookingHorizonDays: 7,
    closedDays: [
      { date: fridays[0]!, scope: 'both', reasonAr: 'عطلة أسبوعية', reasonEn: 'Weekly holiday' },
      { date: addDays(today, 2), scope: 'delivery', reasonAr: 'جرد المخزون', reasonEn: 'Stock count' },
    ].sort((a, b) => a.date.localeCompare(b.date)) as OperationsSettings['closedDays'],
    capacity: { ordersPerDay: 120, carcassesPerDay: 40 },
    minOrderHalalas: 10000,
    deliveryFeeHalalas: 1500,
    cod: { enabled: true, maxOrderHalalas: 100000, allowedOrderTypes: ['ready_meat', 'carcass'], confirmation: 'auto' },
    paused: { isPaused: false, messageAr: 'الطلبات متوقفة مؤقتًا، سنعود قريبًا', messageEn: 'Orders are paused for now, we will be back soon' },
    complaintWindowHours: 48,
    workingHours: (['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as const).map((day) => ({ day, open: day !== 'fri', start: '08:00', end: '22:00' })),
  };
}

type State = { settings: OperationsSettings; vendors: Map<string, VendorCapacity> };
const g = globalThis as { __operations?: State };
const state: State = (g.__operations ??= { settings: seed(), vendors: new Map() });

const denied = { ok: false, code: 'NOT_ALLOWED', status: 403 } as const;
const invalid = (field: string, constraint: string) => ({ ok: false, code: 'VALIDATION_FAILED', status: 400, details: [{ field, constraints: [constraint] }] }) as const;
const limited = (token: string) => token.endsWith('-limited');
const ok = <T>(data: T): ApiResult<T> => ({ ok: true, data: structuredClone(data) });

function capacityOf(vendorId: string): VendorCapacity {
  let c = state.vendors.get(vendorId);
  if (!c) state.vendors.set(vendorId, (c = { ordersPerDay: null, carcassesPerDay: null, days: [] }));
  return c;
}

export const mockOperations: OperationsBackend = {
  async get(token) {
    return limited(token) ? denied : ok(state.settings);
  },
  async update(token, _lang, patch) {
    if (limited(token)) return denied;
    // The API's rule: a closed day may not be in the past; days already saved stay (they are history).
    const today = riyadhToday();
    const known = new Set(state.settings.closedDays.map((d) => d.date));
    const past = patch.closedDays?.findIndex((d) => d.date < today && !known.has(d.date)) ?? -1;
    if (past >= 0) return invalid(`closedDays.${past}.date`, 'notPast');
    const next = { ...state.settings, ...patch };
    if (!OperationsSchema.safeParse(next).success) return invalid('', 'invalid');
    next.closedDays = [...next.closedDays].sort((a, b) => a.date.localeCompare(b.date));
    state.settings = next;
    return ok(next);
  },
  async setPause(token, _lang, paused) {
    if (limited(token)) return denied;
    state.settings = { ...state.settings, paused };
    return ok(state.settings);
  },
  async vendorCapacity(token, _lang, vendorId) {
    return limited(token) ? denied : ok(capacityOf(vendorId));
  },
  async setVendorDefault(token, _lang, vendorId, body) {
    if (limited(token)) return denied;
    return ok(Object.assign(capacityOf(vendorId), body));
  },
  async setDay(token, _lang, vendorId, date, body) {
    if (limited(token)) return denied;
    if (date < riyadhToday()) return invalid('date', 'notPast');
    const c = capacityOf(vendorId);
    const old = c.days.find((d) => d.date === date);
    c.days = [...c.days.filter((d) => d.date !== date), { date, ...body, ordersBooked: old?.ordersBooked ?? 0, carcassesBooked: old?.carcassesBooked ?? 0 }].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    return ok(c);
  },
  async removeDay(token, _lang, vendorId, date) {
    if (limited(token)) return denied;
    const c = capacityOf(vendorId);
    if (!c.days.some((d) => d.date === date)) return { ok: false, code: 'NOT_FOUND', status: 404 };
    c.days = c.days.filter((d) => d.date !== date);
    return ok(c);
  },
};
