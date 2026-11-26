import { Module } from '@nestjs/common';
import { CLOCK } from '@common/time/clock.port';
import { SystemClock } from '@common/time/system-clock';
import { SettingsModule } from '@modules/settings';
import { VendorsModule } from '@modules/vendors';
import { CapacityService } from './capacity.service';
import { AdminSchedulingController } from './controllers/admin.controller';
import { SchedulingService } from './scheduling.service';

/**
 * The scheduling engine and vendor capacity (SCH-API-2): which days a cart can be
 * fulfilled on (`SchedulingService`) and taking a place on a day (`CapacityService`).
 * The days route is the checkout module's (it reads the cart). The admin capacity
 * routes still answer NOT_IMPLEMENTED (after November 30).
 */
@Module({
  imports: [SettingsModule, VendorsModule],
  controllers: [AdminSchedulingController],
  providers: [
    SchedulingService,
    CapacityService,
    { provide: CLOCK, useClass: SystemClock },
  ],
  exports: [SchedulingService, CapacityService],
})
export class SchedulingModule {}
