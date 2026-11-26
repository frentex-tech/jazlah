import type { CheckoutDay } from '../domain/checkout-day.type';
import type { CheckoutDayListResponseDto } from './dto/checkout-day-list-response.dto';

/** The days as the contract shows them. */
export function toCheckoutDayListResponse(
  days: readonly CheckoutDay[],
): CheckoutDayListResponseDto {
  return {
    items: days.map((day) => ({
      date: day.date,
      isAvailable: day.isAvailable,
      reason: day.reason,
      window: day.window === null ? null : { ...day.window },
    })),
  };
}
