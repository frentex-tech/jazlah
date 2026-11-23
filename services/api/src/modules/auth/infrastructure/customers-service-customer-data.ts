import { Injectable } from '@nestjs/common';
import {
  CustomerAddressesService,
  CustomerProfilesService,
  MarketingConsentsService,
} from '@modules/customers';
import type { CustomerData } from '../domain/ports/customer-data.port';

/** A customer's data erased through the customers module's services. */
@Injectable()
export class CustomersServiceCustomerData implements CustomerData {
  constructor(
    private readonly profiles: CustomerProfilesService,
    private readonly addresses: CustomerAddressesService,
    private readonly consents: MarketingConsentsService,
  ) {}

  async eraseOf(userId: string): Promise<void> {
    await this.consents.withdrawForDeletion(userId);
    await this.addresses.eraseOf(userId);
    await this.profiles.eraseOf(userId);
  }
}
