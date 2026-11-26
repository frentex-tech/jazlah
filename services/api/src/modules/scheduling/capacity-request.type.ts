import type { CalendarDate } from '@common/time/calendar-date.type';

/** One order's place on a vendor's day: the order itself and its whole carcasses (0 for none). */
export type CapacityRequest = Readonly<{
  vendorId: string;
  date: CalendarDate;
  /** A whole number, zero or more. */
  carcasses: number;
}>;
