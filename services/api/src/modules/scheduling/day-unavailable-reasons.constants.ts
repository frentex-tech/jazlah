/** Why a day cannot be chosen: past the cut-off, a closed day, full, beyond the booking horizon, or the store closed that day (pickup). */
export const DAY_UNAVAILABLE_REASONS = [
  'PAST_CUTOFF',
  'CLOSED',
  'FULL',
  'OUTSIDE_HORIZON',
  'VENDOR_CLOSED',
] as const;
