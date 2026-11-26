import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { PickupPoint } from '../pickup-point.type';
import type { CartScheduling } from '../ports/cart-scheduling.port';

/** CartScheduling in memory: every day is open unless a test marks it full or unavailable; records the requests. */
export class FakeCartScheduling implements CartScheduling {
  readonly full = new Set<string>();
  readonly unavailable = new Map<string, string>();
  readonly requests: Parameters<CartScheduling['assertDayAvailable']>[0][] = [];

  assertDayAvailable(
    request: Parameters<CartScheduling['assertDayAvailable']>[0],
  ): Promise<void> {
    this.requests.push(request);
    if (this.full.has(request.date)) {
      return Promise.reject(new AppError(ErrorCode.DAY_FULL));
    }
    const reason = this.unavailable.get(request.date);
    if (reason !== undefined) {
      return Promise.reject(
        new AppError(ErrorCode.DAY_NOT_AVAILABLE, { details: { reason } }),
      );
    }
    return Promise.resolve();
  }

  pickupPoint(vendorId: string): Promise<PickupPoint> {
    return Promise.resolve({
      name: { ar: vendorId, en: vendorId },
      address: null,
      location: null,
      phone: null,
      hours: null,
    });
  }
}
