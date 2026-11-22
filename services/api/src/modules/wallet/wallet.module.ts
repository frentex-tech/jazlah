import { Module } from '@nestjs/common';
import { AdminWalletController } from './api/controllers/admin.controller';
import { CustomerWalletController } from './api/controllers/customer.controller';

/**
 * The customer wallet (WAL-API-1): an append-only ledger, the balance, admin credits and debits. Until its tasks land, the controllers carry the contract and answer NOT_IMPLEMENTED.
 */
@Module({
  controllers: [CustomerWalletController, AdminWalletController],
})
export class WalletModule {}
