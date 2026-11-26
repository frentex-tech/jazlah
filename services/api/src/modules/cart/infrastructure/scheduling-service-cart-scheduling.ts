import { Injectable } from '@nestjs/common';
import { SchedulingService } from '@modules/scheduling';
import type { CartOrderType } from '../domain/cart-order-type.type';
import type { FulfilmentMethod } from '../domain/fulfilment-method.type';
import type { PickupPoint } from '../domain/pickup-point.type';
import type { CartScheduling } from '../domain/ports/cart-scheduling.port';

/** `CartScheduling` on the scheduling module's `SchedulingService`. */
@Injectable()
export class SchedulingServiceCartScheduling implements CartScheduling {
  constructor(private readonly scheduling: SchedulingService) {}

  async assertDayAvailable(
    request: Readonly<{
      vendorId: string;
      method: FulfilmentMethod;
      orderTypes: readonly CartOrderType[];
      date: string;
    }>,
  ): Promise<void> {
    await this.scheduling.assertDayAvailable(
      {
        vendorId: request.vendorId,
        method: request.method,
        orderTypes: request.orderTypes,
      },
      request.date,
    );
  }

  async pickupPoint(vendorId: string): Promise<PickupPoint> {
    return (await this.scheduling.pickupTerms(vendorId)).point;
  }
}
