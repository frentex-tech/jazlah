import { Module } from '@nestjs/common';
import { AppConfigModule } from '@config/app-config.module';
import { DatabaseModule } from '@infra/database/database.module';
import { StorageModule } from '@integrations/storage';
import { UsersModule } from '@modules/users';
import { PlatformVendorModule } from '@modules/vendors';

/**
 * What `pnpm db:seed` needs and nothing more: configuration, the database, the storage
 * integration (placeholder files), users (users and staff access as the API makes
 * them) and the platform vendor's creation. No HTTP server, queue or Redis.
 */
@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    StorageModule,
    UsersModule,
    PlatformVendorModule,
  ],
})
export class SeedModule {}
