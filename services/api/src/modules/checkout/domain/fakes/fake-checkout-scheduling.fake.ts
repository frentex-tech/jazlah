import type { CheckoutDay } from '../checkout-day.type';
import type { CheckoutScheduling } from '../ports/checkout-scheduling.port';

/** CheckoutScheduling in memory: answers the days a test sets and records the requests. */
export class FakeCheckoutScheduling implements CheckoutScheduling {
  days: CheckoutDay[] = [];
  readonly requests: Parameters<CheckoutScheduling['availableDays']>[0][] = [];

  availableDays(
    request: Parameters<CheckoutScheduling['availableDays']>[0],
  ): Promise<CheckoutDay[]> {
    this.requests.push(request);
    return Promise.resolve(this.days);
  }
}
