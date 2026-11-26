import type { CalendarDate } from '@common/time/calendar-date.type';
import type { CheckoutDay } from './checkout-day.type';
import { computeCheckoutDays } from './compute-checkout-days';
import type { DayRules } from './day-rules.type';

/**
 * Whether `date` can be chosen, as `computeCheckoutDays` decides: a day before today
 * is PAST_CUTOFF, one after the horizon OUTSIDE_HORIZON.
 */
export function checkoutDayOf(
  rules: DayRules,
  date: CalendarDate,
): CheckoutDay {
  const found = computeCheckoutDays(rules).find((day) => day.date === date);
  if (found !== undefined) {
    return found;
  }
  return {
    date,
    isAvailable: false,
    reason: date < rules.today ? 'PAST_CUTOFF' : 'OUTSIDE_HORIZON',
    window: null,
  };
}
