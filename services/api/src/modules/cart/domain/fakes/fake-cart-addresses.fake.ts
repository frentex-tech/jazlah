import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { CartAddresses } from '../ports/cart-addresses.port';

/** CartAddresses in memory: addresses a test sets per customer, covered or not. */
export class FakeCartAddresses implements CartAddresses {
  private readonly addresses = new Map<string, boolean>();

  set(userId: string, addressId: string, isCovered: boolean): void {
    this.addresses.set(`${userId}/${addressId}`, isCovered);
  }

  coverageOf(
    userId: string,
    addressId: string,
  ): Promise<Readonly<{ isCovered: boolean }>> {
    const isCovered = this.addresses.get(`${userId}/${addressId}`);
    return isCovered === undefined
      ? Promise.reject(new AppError(ErrorCode.NOT_FOUND))
      : Promise.resolve({ isCovered });
  }
}
