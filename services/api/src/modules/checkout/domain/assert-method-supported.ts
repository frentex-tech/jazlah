import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { CheckoutCart } from './checkout-cart.type';

/**
 * CART_EMPTY for an empty cart; FULFILMENT_NOT_SUPPORTED when a line's product does
 * not allow `method` (one the public cannot see allows none).
 */
export function assertMethodSupported(
  cart: CheckoutCart,
  method: 'delivery' | 'pickup',
): string {
  if (cart.vendorId === null || cart.lineFulfilments.length === 0) {
    throw new AppError(ErrorCode.CART_EMPTY);
  }
  const supported = cart.lineFulfilments.every(
    (fulfilment) => fulfilment === 'both' || fulfilment === method,
  );
  if (!supported) {
    throw new AppError(ErrorCode.FULFILMENT_NOT_SUPPORTED);
  }
  return cart.vendorId;
}
