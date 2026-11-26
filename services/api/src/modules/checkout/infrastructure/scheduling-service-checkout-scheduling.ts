import { Injectable } from '@nestjs/common';
import { SchedulingService } from '@modules/scheduling';
import type { CheckoutCart } from '../domain/checkout-cart.type';
import type { CheckoutDay } from '../domain/checkout-day.type';
import type { CheckoutScheduling } from '../domain/ports/checkout-scheduling.port';

/** `CheckoutScheduling` on the scheduling module's `SchedulingService`. */
@Injectable()
export class SchedulingServiceCheckoutScheduling implements CheckoutScheduling {
  constructor(private readonly scheduling: SchedulingService) {}

  availableDays(
    request: Readonly<{
      vendorId: string;
      method: 'delivery' | 'pickup';
      orderTypes: CheckoutCart['orderTypes'];
    }>,
  ): Promise<CheckoutDay[]> {
    return this.scheduling.availableDays(request);
  }
}
