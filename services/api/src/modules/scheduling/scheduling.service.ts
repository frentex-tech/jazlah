import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { CalendarDate } from '@common/time/calendar-date.type';
import { CLOCK, type Clock } from '@common/time/clock.port';
import { RiyadhCalendar } from '@common/time/riyadh-calendar';
import { OperationsSettingsService } from '@modules/settings';
import { VendorDirectory } from '@modules/vendors';
import type { AvailableDaysRequest } from './available-days-request.type';
import { CapacityService } from './capacity.service';
import type { CheckoutDay } from './checkout-day.type';
import { checkoutDayOf } from './checkout-day-of';
import { computeCheckoutDays } from './compute-checkout-days';
import type { DayRules } from './day-rules.type';
import type { PickupTerms } from './pickup-terms.type';
import { pickupTermsOf } from './pickup-terms-of';

/**
 * Which days a cart can be fulfilled on (SCH-API-2), the one source of truth for the
 * days route, the cart's fulfilment and placing an order. The interface is frozen:
 * orders, occasions, kitchens and Adha depend on it.
 *
 * - `availableDays`: every day of the booking horizon with whether it can be chosen
 *   (`computeCheckoutDays`), now in Riyadh, the settings as saved, the vendor's
 *   bookings (`CapacityService`).
 * - `assertDayAvailable`: the same decision for one day: DAY_FULL when full,
 *   DAY_NOT_AVAILABLE (`details.reason`) otherwise; answers the day's window.
 * - `pickupTerms`: how the store offers pickup (`pickupTermsOf`, an ASSUMPTION).
 *
 * The capacity is taken when the order is placed (`CapacityService.reserve`), not here.
 */
@Injectable()
export class SchedulingService {
  constructor(
    private readonly settings: OperationsSettingsService,
    private readonly capacity: CapacityService,
    private readonly vendors: VendorDirectory,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async availableDays(request: AvailableDaysRequest): Promise<CheckoutDay[]> {
    return computeCheckoutDays(await this.rulesFor(request));
  }

  /** The day's window when it can be chosen; DAY_FULL or DAY_NOT_AVAILABLE otherwise. */
  async assertDayAvailable(
    request: AvailableDaysRequest,
    date: CalendarDate,
  ): Promise<CheckoutDay> {
    const day = checkoutDayOf(await this.rulesFor(request), date);
    if (day.reason === 'FULL') {
      throw new AppError(ErrorCode.DAY_FULL);
    }
    if (!day.isAvailable) {
      throw new AppError(ErrorCode.DAY_NOT_AVAILABLE, {
        details: { reason: day.reason },
      });
    }
    return day;
  }

  /** How the store offers pickup; NOT_FOUND for an unknown store. */
  async pickupTerms(vendorId: string): Promise<PickupTerms> {
    const [store, settings] = await Promise.all([
      this.vendors.storeOf(vendorId),
      this.settings.current(),
    ]);
    if (store === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return pickupTermsOf(store, settings.deliveryWindow);
  }

  private async rulesFor(request: AvailableDaysRequest): Promise<DayRules> {
    const now = this.clock.now();
    const today = RiyadhCalendar.dateOf(now);
    const settings = await this.settings.current();
    const last = RiyadhCalendar.addDays(
      today,
      Math.max(settings.bookingHorizonDays - 1, 0),
    );
    const [bookings, window] = await Promise.all([
      this.capacity.bookingsOf(request.vendorId, today, last),
      request.method === 'pickup'
        ? this.pickupTerms(request.vendorId).then((terms) => terms.window)
        : Promise.resolve(settings.deliveryWindow),
    ]);
    return {
      today,
      minuteOfDay: RiyadhCalendar.minuteOfDay(now),
      method: request.method,
      orderTypes: request.orderTypes,
      cutoffs: settings.cutoffs,
      bookingHorizonDays: settings.bookingHorizonDays,
      closedDays: settings.closedDays,
      window,
      bookings,
      defaultOrdersLimit: settings.defaultCapacity.ordersPerDay,
    };
  }
}
