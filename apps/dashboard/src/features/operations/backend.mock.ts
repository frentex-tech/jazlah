// The in-process mock of backend.ts (DASHBOARD_API_MOCK=1): loaded only through lib/mock-backends.ts, so a production
// build leaves it out. Seeds follow 118:11181 in the shapes of openapi.json; an admin access token ending in «-limited»
// is answered PERMISSION_DENIED (118:13416), as in the other admin mocks.
import type { ApiResult } from '@/lib/auth/panel-session';
import { addDays, riyadhToday } from '@/lib/date';
import type { OperationsBackend } from './backend';
import { PageSchema } from './schema';
import type { OperationsSettings, VendorCapacity } from './types';

function seed(): OperationsSettings {
  const today = riyadhToday();
  const fridays = [0, 1, 2, 3, 4, 5, 6].map((n) => addDays(today, n)).filter((d) => new Date(`${d}T00:00:00Z`).getUTCDay() === 5);
  return {
    deliveryWindow: { start: '16:00', end: '18:00' },
    cutoffs: {
      readyMeat: { time: '14:00', leadDays: 0 },
      carcass: { time: '12:00', leadDays: 1 },
      cooked: { time: '10:00', leadDays: 1 },
      occasion: { time: '09:00', leadDays: 3 },
      adha: { time: null, leadDays: 3 },
    },
    bookingHorizonDays: 7,
    closedDays: [
      { date: fridays[0]!, scope: 'both', reasonAr: 'عطلة أسبوعية', reasonEn: 'Weekly holiday' },
      { date: addDays(today, 2), scope: 'delivery', reasonAr: 'جرد المخزون', reasonEn: 'Stock count' },
    ].sort((a, b) => a.date.localeCompare(b.date)) as OperationsSettings['closedDays'],
    defaultCapacity: { ordersPerDay: 120, carcassesPerDay: 40 },
    minOrderHalalas: 10000,
    deliveryFeeHalalas: 1500,
    cod: { enabled: true, maxOrderHalalas: 100000, allowedOrderTypes: ['ready_meat', 'carcass'], confirmation: 'auto' },
    paused: { isPaused: false, messageAr: null, messageEn: null },
    complaintWindowHours: 48,
    updatedAt: new Date().toISOString(),
  };
}

type State = { settings: OperationsSettings; vendors: Map<string, Omit<VendorCapacity, 'vendorId'>> };
const g = globalThis as { __operations?: State };
const state: State = (g.__operations ??= { settings: seed(), vendors: new Map() });

const denied = { ok: false, code: 'PERMISSION_DENIED', status: 403 } as const;
const invalid = (field: string, constraint: string) => ({ ok: false, code: 'VALIDATION_FAILED', status: 400, details: [{ field, constraints: [constraint] }] }) as const;
const limited = (token: string) => token.endsWith('-limited');
const ok = <T>(data: T): ApiResult<T> => ({ ok: true, data: structuredClone(data) });

function capacityOf(vendorId: string) {
  let c = state.vendors.get(vendorId);
  if (!c) state.vendors.set(vendorId, (c = { ordersPerDay: null, carcassesPerDay: null, days: [] }));
  return c;
}
const capacity = (vendorId: string): ApiResult<VendorCapacity> => ok({ vendorId, ...capacityOf(vendorId) });

export const mockOperations: OperationsBackend = {
  async pause() {
    return ok(state.settings.paused);
  },
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
    const next = { ...state.settings, ...patch, updatedAt: new Date().toISOString() };
    if (!PageSchema.safeParse(next).success) return invalid('', 'invalid');
    next.closedDays = [...next.closedDays].sort((a, b) => a.date.localeCompare(b.date));
    state.settings = next;
    return ok(next);
  },
  async setPause(token, _lang, p) {
    if (limited(token)) return denied;
    // The messages are kept while paused and null otherwise, as the API answers them.
    const paused = p.isPaused ? { isPaused: true, messageAr: p.messageAr ?? null, messageEn: p.messageEn ?? null } : { isPaused: false, messageAr: null, messageEn: null };
    state.settings = { ...state.settings, paused, updatedAt: new Date().toISOString() };
    return ok(state.settings);
  },
  async vendorCapacity(token, _lang, vendorId) {
    return limited(token) ? denied : capacity(vendorId);
  },
  async setVendorDefault(token, _lang, vendorId, body) {
    if (limited(token)) return denied;
    Object.assign(capacityOf(vendorId), body);
    return capacity(vendorId);
  },
  async setDay(token, _lang, vendorId, date, body) {
    if (limited(token)) return denied;
    if (date < riyadhToday()) return invalid('date', 'notPast');
    const c = capacityOf(vendorId);
    const old = c.days.find((d) => d.date === date);
    c.days = [...c.days.filter((d) => d.date !== date), { date, ...body, ordersBooked: old?.ordersBooked ?? 0, carcassesBooked: old?.carcassesBooked ?? 0 }].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    return capacity(vendorId);
  },
  async removeDay(token, _lang, vendorId, date) {
    if (limited(token)) return denied;
    const c = capacityOf(vendorId);
    if (!c.days.some((d) => d.date === date)) return { ok: false, code: 'NOT_FOUND', status: 404 };
    c.days = c.days.filter((d) => d.date !== date);
    return capacity(vendorId);
  },
};
