import { Module } from '@nestjs/common';
import { AdminSettingsController } from './controllers/admin.controller';
import { PublicSettingsController } from './controllers/public.controller';

/**
 * The operations settings (SCH-API-1): delivery window, cut-offs, closed days, capacity defaults, minimum order, fees, cash on delivery and the pause. Until its tasks land, the controllers carry the contract and answer NOT_IMPLEMENTED.
 */
@Module({
  controllers: [AdminSettingsController, PublicSettingsController],
})
export class SettingsModule {}
