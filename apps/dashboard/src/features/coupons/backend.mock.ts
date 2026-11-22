// The in-process mock of backend.ts (DASHBOARD_API_MOCK=1): loaded only through lib/mock-backends.ts, so a production
// build leaves it out. An admin access token ending in «-limited» is answered NOT_ALLOWED, as in the other admin mocks.
import { mockVendors } from '@/features/admin-vendors/backend.mock';
import { mock as catalog } from '@/features/catalog/backend.mock';
import type { CouponsBackend } from './backend';
import { CouponPatchSchema, CouponSchema } from './schema';
import { statusOf, type Coupon, type CouponInput, type CouponUsage } from './types';

const DAY = 86_400_000;
type Stored = Omit<Coupon, 'status'> & { usage: CouponUsage };

// Seeds around today, so each status shows: active, scheduled, expired, inactive; one scoped to a vendor and a category.
function seed(): Map<string, Stored> {
  const now = Date.now();
  const at = (days: number) => new Date(Math.floor(now / DAY) * DAY + days * DAY - 3 * 3_600_000).toISOString(); // Riyadh midnight
  const falah = [...mockVendors.values()].find((v) => v.name.en === 'Al Falah Butchery')?.id;
  const sheep = catalog.items.categories[0]?.id;
  const base = { maxDiscountHalalas: null, minOrderHalalas: null, vendorIds: [], categoryIds: [], usageLimit: null, perUserLimit: 1, isActive: true, firstOrderOnly: false };
  const rows: (Partial<Stored> & Pick<Stored, 'code' | 'type' | 'value' | 'startsAt' | 'endsAt'>)[] = [
    { code: 'RAMADAN25', type: 'percent', value: 25, maxDiscountHalalas: 5000, minOrderHalalas: 10000, startsAt: at(-10), endsAt: at(20), usageLimit: 500, usage: { uses: 132, distinctUsers: 120, totalDiscountHalalas: 528000 } },
    { code: 'WELCOME50', type: 'fixed', value: 5000, minOrderHalalas: 20000, startsAt: at(-40), endsAt: at(320), firstOrderOnly: true, usage: { uses: 48, distinctUsers: 48, totalDiscountHalalas: 240000 } },
    { code: 'FALAH15', type: 'percent', value: 15, vendorIds: falah ? [falah] : [], categoryIds: sheep ? [sheep] : [], startsAt: at(-5), endsAt: at(25), usageLimit: 100, perUserLimit: 2, usage: { uses: 100, distinctUsers: 61, totalDiscountHalalas: 187500 } },
    { code: 'EID10', type: 'percent', value: 10, startsAt: at(15), endsAt: at(19), usageLimit: 1000, usage: { uses: 0, distinctUsers: 0, totalDiscountHalalas: 0 } },
    { code: 'NATIONAL94', type: 'fixed', value: 9400, startsAt: at(-70), endsAt: at(-60), usageLimit: 940, usage: { uses: 940, distinctUsers: 902, totalDiscountHalalas: 8836000 } },
    { code: 'TEST100', type: 'fixed', value: 10000, startsAt: at(-30), endsAt: at(30), usageLimit: 10, perUserLimit: null, isActive: false, usage: { uses: 3, distinctUsers: 1, totalDiscountHalalas: 30000 } },
  ];
  return new Map(
    rows.map((r, i) => {
      const id = `c0000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`;
      const createdAt = new Date(Date.parse(r.startsAt) - DAY).toISOString();
      const usage = r.usage!;
      return [id, { ...base, ...r, id, usage, usageCount: usage.uses, createdAt, updatedAt: createdAt } as Stored];
    }),
  );
}

const g = globalThis as { __coupons?: Map<string, Stored> };
const coupons: Map<string, Stored> = (g.__coupons ??= seed());

const denied = { ok: false, code: 'NOT_ALLOWED', status: 403 } as const;
const notFound = { ok: false, code: 'NOT_FOUND', status: 404 } as const;
const taken = { ok: false, code: 'COUPON_CODE_TAKEN', status: 409 } as const;
const invalid = (field: string, constraint: string) => ({ ok: false, code: 'VALIDATION_FAILED', status: 400, details: [{ field, constraints: [constraint] }] }) as const;
const limited = (token: string) => token.endsWith('-limited');
const out = ({ usage: _u, ...c }: Stored): Coupon => structuredClone({ ...c, status: statusOf(c) });
const codeUsed = (code: string, except?: string) => [...coupons.values()].some((c) => c.id !== except && c.code.toLowerCase() === code.toLowerCase());

export const mockCoupons: CouponsBackend = {
  async list(token, _l, { status, q, cursor, limit = 20 }) {
    if (limited(token)) return denied;
    const from = cursor === undefined ? 0 : Number(Buffer.from(cursor, 'base64url').toString());
    if (!Number.isInteger(from) || from < 0) return invalid('cursor', 'isCursor');
    const all = [...coupons.values()]
      .map(out)
      .filter((c) => (!status || c.status === status) && (!q || c.code.includes(q.trim().toUpperCase())))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const next = from + limit < all.length ? Buffer.from(String(from + limit)).toString('base64url') : null;
    return { ok: true, data: { items: all.slice(from, from + limit), nextCursor: next } };
  },
  async get(token, _l, id) {
    if (limited(token)) return denied;
    const c = coupons.get(id);
    return c ? { ok: true, data: out(c) } : notFound;
  },
  async create(token, _l, body) {
    if (limited(token)) return denied;
    const parsed = CouponSchema.safeParse(body);
    if (!parsed.success) return invalid(String(parsed.error.issues[0]?.path[0] ?? ''), 'invalid');
    if (codeUsed(parsed.data.code)) return taken;
    const now = new Date().toISOString();
    const c: Stored = { ...(parsed.data as CouponInput), id: crypto.randomUUID(), usageCount: 0, createdAt: now, updatedAt: now, usage: { uses: 0, distinctUsers: 0, totalDiscountHalalas: 0 } };
    coupons.set(c.id, c);
    return { ok: true, data: out(c) };
  },
  async update(token, _l, id, patch) {
    if (limited(token)) return denied;
    const c = coupons.get(id);
    if (!c) return notFound;
    const parsed = CouponPatchSchema.safeParse(patch);
    if (!parsed.success) return invalid(String(parsed.error.issues[0]?.path[0] ?? ''), 'invalid');
    const next: Stored = { ...c, ...parsed.data, updatedAt: new Date().toISOString() };
    const whole = CouponSchema.safeParse(next);
    if (!whole.success) return invalid(String(whole.error.issues[0]?.path[0] ?? ''), whole.error.issues[0]?.code === 'custom' ? whole.error.issues[0].message : 'invalid');
    if (codeUsed(next.code, id)) return taken;
    coupons.set(id, next);
    return { ok: true, data: out(next) };
  },
  async usage(token, _l, id) {
    if (limited(token)) return denied;
    const c = coupons.get(id);
    return c ? { ok: true, data: { ...c.usage } } : notFound;
  },
};
