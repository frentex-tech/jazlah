import { Module } from '@nestjs/common';
import { AppConfigModule } from '@config/app-config.module';
import { DatabaseModule } from '@infra/database/database.module';
import { PlatformVendorModule } from '@modules/vendors';

/** What `pnpm vendor:create-platform` needs and nothing more: configuration, the database, vendors. */
@Module({
  imports: [AppConfigModule, DatabaseModule, PlatformVendorModule],
})
export class CreatePlatformVendorModule {}
