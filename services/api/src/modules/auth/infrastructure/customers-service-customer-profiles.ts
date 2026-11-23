import { Injectable } from '@nestjs/common';
import {
  CustomerProfilesService,
  MarketingConsentsService,
} from '@modules/customers';
import type { CustomerProfileSummary } from '../domain/customer-profile-summary.type';
import type { CustomerProfiles } from '../domain/ports/customer-profiles.port';

/** Customers' profiles and consent through the customers module's services. */
@Injectable()
export class CustomersServiceCustomerProfiles implements CustomerProfiles {
  constructor(
    private readonly profiles: CustomerProfilesService,
    private readonly consents: MarketingConsentsService,
  ) {}

  async summaryOf(userId: string): Promise<CustomerProfileSummary> {
    const profile = await this.profiles.profileOf(userId);
    return {
      fullName: profile.fullName,
      email: profile.email,
      preferredLanguage: profile.preferredLanguage,
      isComplete: profile.isComplete,
      marketingConsent: await this.consents.currentOf(userId),
    };
  }

  async isComplete(userId: string): Promise<boolean> {
    return (await this.profiles.profileOf(userId)).isComplete;
  }
}
