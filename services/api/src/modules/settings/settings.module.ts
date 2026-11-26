import { Module } from '@nestjs/common';
import { CLOCK } from '@common/time/clock.port';
import { SystemClock } from '@common/time/system-clock';
import { AuditModule } from '@infra/audit/audit.module';
import { AdminSettingsController } from './controllers/admin.controller';
import { PublicSettingsController } from './controllers/public.controller';
import { OperationsSettingsService } from './operations-settings.service';

/**
 * The operations settings (SCH-API-1): delivery window, cut-offs, closed days, capacity
 * defaults, minimum order, fees, cash on delivery and the pause. Exports
 * `OperationsSettingsService` for the cart, scheduling and checkout.
 */
@Module({
  imports: [AuditModule],
  controllers: [AdminSettingsController, PublicSettingsController],
  providers: [
    OperationsSettingsService,
    { provide: CLOCK, useClass: SystemClock },
  ],
  exports: [OperationsSettingsService],
})
export class SettingsModule {}
