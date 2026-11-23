import { Module } from '@nestjs/common';
import { AdminSchedulingController } from './controllers/admin.controller';
import { CustomerSchedulingController } from './controllers/customer.controller';

/**
 * The scheduling engine and vendor capacity (SCH-API-2): which days a cart can be fulfilled on, and reserving them. Until its tasks land, the controllers carry the contract and answer NOT_IMPLEMENTED.
 */
@Module({
  controllers: [CustomerSchedulingController, AdminSchedulingController],
})
export class SchedulingModule {}
