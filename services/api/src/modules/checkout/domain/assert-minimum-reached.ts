import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { Money } from '@common/money/money';

/**
 * MIN_ORDER_NOT_MET (`details.minOrderHalalas`, `details.remainingHalalas`) while the
 * subtotal is below the minimum order; `remaining` is what is still missing.
 */
export function assertMinimumReached(minimum: Money, remaining: Money): void {
  if (remaining.isGreaterThan(Money.zero())) {
    throw new AppError(ErrorCode.MIN_ORDER_NOT_MET, {
      details: {
        minOrderHalalas: minimum.halalas,
        remainingHalalas: remaining.halalas,
      },
    });
  }
}
