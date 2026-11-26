/** One day of the booking horizon as the day picker shows it. */
export type CheckoutDay = Readonly<{
  date: string;
  isAvailable: boolean;
  reason:
    | 'PAST_CUTOFF'
    | 'CLOSED'
    | 'FULL'
    | 'OUTSIDE_HORIZON'
    | 'VENDOR_CLOSED'
    | null;
  window: Readonly<{ start: string; end: string }> | null;
}>;
