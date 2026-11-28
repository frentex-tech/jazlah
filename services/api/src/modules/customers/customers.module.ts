import { Module } from '@nestjs/common';
import { CoverageModule } from '@modules/coverage';
import { OrdersModule } from '@modules/orders';
import { UsersModule } from '@modules/users';
import { CustomerCustomersController } from './controllers/customer.controller';
import { CustomerAddressesService } from './customer-addresses.service';
import { CustomerProfilesService } from './customer-profiles.service';
import { MarketingConsentsService } from './marketing-consents.service';

/**
 * The customers module: what a customer keeps with us beyond their identity, which is
 * the users module's. CRUD-shaped, with one service per sub-resource (`modules.md`):
 * the profile (CustomerProfilesService), the marketing consent history
 * (MarketingConsentsService) and the saved addresses (CustomerAddressesService). Every
 * write locks the user's row first, through UsersService.
 *
 * All three are exported: the auth module reads the profile and the consent for
 * sign-in and `me`, and erases them when an account is deleted; orders will read
 * addresses and whether a profile is complete. Each address returned says whether it
 * is covered (CoverageModule).
 */
@Module({
  imports: [UsersModule, CoverageModule, OrdersModule],
  controllers: [CustomerCustomersController],
  providers: [
    CustomerProfilesService,
    MarketingConsentsService,
    CustomerAddressesService,
  ],
  exports: [
    CustomerProfilesService,
    MarketingConsentsService,
    CustomerAddressesService,
  ],
})
export class CustomersModule {}
