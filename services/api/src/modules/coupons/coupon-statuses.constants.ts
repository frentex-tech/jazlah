/** A coupon’s state, worked out in this order: switched off (`inactive`), before its start (`scheduled`), on or after its end (`expired`), else `active`. */
export const COUPON_STATUSES = [
  'active',
  'scheduled',
  'expired',
  'inactive',
] as const;
