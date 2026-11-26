import type { CalendarDate } from '@common/time/calendar-date.type';
import type { TimeWindow } from '@modules/settings';
import type { DAY_UNAVAILABLE_REASONS } from './day-unavailable-reasons.constants';

/** One day of the booking horizon and whether a cart can be fulfilled on it. */
export type CheckoutDay = Readonly<{
  date: CalendarDate;
  isAvailable: boolean;
  /** Null when available. */
  reason: (typeof DAY_UNAVAILABLE_REASONS)[number] | null;
  /** The window of the day; null when unavailable. */
  window: TimeWindow | null;
}>;
