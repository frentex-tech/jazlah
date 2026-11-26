import type { CalendarDate } from '@common/time/calendar-date.type';
import { RiyadhCalendar } from '@common/time/riyadh-calendar';
import type { CheckoutDay } from './checkout-day.type';
import type { DayRules } from './day-rules.type';
import { ORDER_TYPE_CUTOFF_KEYS } from './order-type-cutoff-keys.constants';

/**
 * The days of the booking horizon and whether each can be chosen (SCH-API-2, FR-SCH-02
 * to 05), all in the Riyadh calendar. Pure: the caller reads the clock, the settings
 * and the bookings.
 *
 * - The horizon is `bookingHorizonDays` days counted from today, today included.
 * - The earliest day is the latest, over the cart's kinds of order, of today +
 *   `leadDays`, plus one day when now is after the cut-off time (12:00 still counts as
 *   before a 12:00 cut-off; 12:01 does not). Earlier days: PAST_CUTOFF.
 * - A closed day closes its scope: `both`, or only `delivery` or `pickup`: CLOSED.
 * - A day the vendor has booked up to its limit (the day's own, else the default): FULL.
 * - An available day offers `window`.
 */
export function computeCheckoutDays(rules: DayRules): CheckoutDay[] {
  const earliest = earliestDay(rules);
  return Array.from({ length: rules.bookingHorizonDays }, (_, offset) => {
    const date = RiyadhCalendar.addDays(rules.today, offset);
    const reason =
      date < earliest
        ? 'PAST_CUTOFF'
        : isClosed(rules, date)
          ? 'CLOSED'
          : isFull(rules, date)
            ? 'FULL'
            : null;
    return reason === null
      ? { date, isAvailable: true, reason, window: rules.window }
      : { date, isAvailable: false, reason, window: null };
  });
}

function earliestDay(rules: DayRules): CalendarDate {
  return rules.orderTypes.reduce((latest, type) => {
    const rule = rules.cutoffs[ORDER_TYPE_CUTOFF_KEYS[type]];
    const late =
      rule.time !== null &&
      rules.minuteOfDay > RiyadhCalendar.minutesOf(rule.time);
    const day = RiyadhCalendar.addDays(
      rules.today,
      rule.leadDays + (late ? 1 : 0),
    );
    return day > latest ? day : latest;
  }, rules.today);
}

function isClosed(rules: DayRules, date: CalendarDate): boolean {
  return rules.closedDays.some(
    (day) =>
      day.date === date && (day.scope === 'both' || day.scope === rules.method),
  );
}

function isFull(rules: DayRules, date: CalendarDate): boolean {
  const booking = rules.bookings.get(date);
  if (booking === undefined) {
    return rules.defaultOrdersLimit <= 0;
  }
  return (
    booking.ordersBooked >= (booking.ordersLimit ?? rules.defaultOrdersLimit)
  );
}
