import type { CalendarDate } from '@common/time/calendar-date.type';
import type { ClosedDay, Cutoffs, TimeWindow } from '@modules/settings';
import type { FULFILMENT_METHODS } from '@modules/orders';
import type { DayBooking } from './day-booking.type';
import type { SchedulingOrderType } from './scheduling-order-type.type';

/** Everything `computeCheckoutDays` decides from: the moment, the settings, the bookings. */
export type DayRules = Readonly<{
  /** Today in Riyadh. */
  today: CalendarDate;
  /** Minutes since midnight in Riyadh, now. */
  minuteOfDay: number;
  method: (typeof FULFILMENT_METHODS)[number];
  /** The kinds of order of the cart; the strictest cut-off applies. */
  orderTypes: readonly SchedulingOrderType[];
  cutoffs: Cutoffs;
  bookingHorizonDays: number;
  closedDays: readonly ClosedDay[];
  /** The window an available day offers for this method. */
  window: TimeWindow;
  /** The vendor's bookings by day; a day missing has none. */
  bookings: ReadonlyMap<CalendarDate, DayBooking>;
  /** The orders a vendor takes on a day without its own limit. */
  defaultOrdersLimit: number;
}>;
