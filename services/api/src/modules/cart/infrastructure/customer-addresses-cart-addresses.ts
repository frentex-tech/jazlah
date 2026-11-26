import { Injectable } from '@nestjs/common';
import { CustomerAddressesService } from '@modules/customers';
import type { CartAddresses } from '../domain/ports/cart-addresses.port';

/** `CartAddresses` on the customers module's addresses (coverage read each time). */
@Injectable()
export class CustomerAddressesCartAddresses implements CartAddresses {
  constructor(private readonly addresses: CustomerAddressesService) {}

  async coverageOf(
    userId: string,
    addressId: string,
  ): Promise<Readonly<{ isCovered: boolean }>> {
    const address = await this.addresses.get(userId, addressId);
    return { isCovered: address.isCovered };
  }
}
