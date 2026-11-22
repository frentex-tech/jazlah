// Admin coupons (CRT-API-3 `Coupon`, sprint-3.md). Not in openapi.json yet: the mock follows these shapes
// (docs/frontend/not-built-yet.md). Money in halalas; times are ISO instants, entered and shown in Riyadh time.

export const COUPON_TYPES = ['percent', 'fixed'] as const;
export type CouponType = (typeof COUPON_TYPES)[number];
/** Derived from `isActive` and the dates (not stored): inactive wins, then before start, after end. */
export const COUPON_STATUSES = ['active', 'scheduled', 'expired', 'inactive'] as const;
export type CouponStatus = (typeof COUPON_STATUSES)[number];

/** What the admin sends on create and edit. `value`: a percent 1–100 for `percent`, halalas for `fixed`. */
export type CouponInput = {
  code: string;
  type: CouponType;
  value: number;
  maxDiscountHalalas: number | null;
  minOrderHalalas: number | null;
  /** Empty: every vendor (category); otherwise only lines of these. */
  vendorIds: string[];
  categoryIds: string[];
  startsAt: string;
  endsAt: string;
  usageLimit: number | null;
  perUserLimit: number | null;
  isActive: boolean;
};

/**
 * `firstOrderOnly` is read but never sent: decision 25 keeps the first-order discount off, so the form shows the switch
 * disabled and creates leave it to the API's default (false).
 */
export type Coupon = CouponInput & { firstOrderOnly: boolean; id: string; status: CouponStatus; usageCount: number; createdAt: string; updatedAt: string };
/** GET …/{id}/usage: the coupon's redemptions (CouponRedemption) summed. */
export type CouponUsage = { uses: number; distinctUsers: number; totalDiscountHalalas: number };
export type Page<T> = { items: T[]; nextCursor: string | null };
export type CouponQuery = { status?: CouponStatus; q?: string; cursor?: string; limit?: number };

export function statusOf(c: Pick<Coupon, 'isActive' | 'startsAt' | 'endsAt'>, now = Date.now()): CouponStatus {
  if (!c.isActive) return 'inactive';
  if (now < Date.parse(c.startsAt)) return 'scheduled';
  return now >= Date.parse(c.endsAt) ? 'expired' : 'active';
}
