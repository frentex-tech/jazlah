// Admin coupons (CRT-API-3), as the generated client types them (docs/frontend/orders.md). Money in halalas; times are
// ISO instants, entered and shown in Riyadh time. Type-only imports: the unit tests run under plain node.
import type { Schemas } from '../../api/client.ts';

export const COUPON_TYPES = ['percent', 'fixed'] as const satisfies readonly Schemas['CouponResponseDto']['type'][];
export type CouponType = (typeof COUPON_TYPES)[number];
/** Worked out by the API from `isActive` and the dates: inactive wins, then before start, after end. */
export const COUPON_STATUSES = ['active', 'scheduled', 'expired', 'inactive'] as const satisfies readonly Schemas['CouponResponseDto']['status'][];
export type CouponStatus = (typeof COUPON_STATUSES)[number];

/** What the admin sends on create (and, partly, on edit). `value`: a percent 1–100 for `percent`, halalas for `fixed`. */
export type CouponInput = Schemas['CreateCouponDto'];
export type CouponPatch = Schemas['UpdateCouponDto'];
export type Coupon = Schemas['CouponResponseDto'];
export type CouponUsage = Schemas['CouponUsageResponseDto'];
export type Page<T> = { items: T[]; nextCursor: string | null };
export type CouponQuery = { status?: CouponStatus; q?: string; cursor?: string; limit?: number };

export function statusOf(c: Pick<Coupon, 'isActive' | 'startsAt' | 'endsAt'>, now = Date.now()): CouponStatus {
  if (!c.isActive) return 'inactive';
  if (now < Date.parse(c.startsAt)) return 'scheduled';
  return now >= Date.parse(c.endsAt) ? 'expired' : 'active';
}
