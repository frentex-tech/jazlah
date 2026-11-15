import { Module } from '@nestjs/common';
import { AppConfigModule } from '@config/app-config.module';
import { DatabaseModule } from '@infra/database/database.module';
import { UsersModule } from '@modules/users';

/** What `pnpm admin:create` needs and nothing more: configuration, the database, users. */
@Module({
  imports: [AppConfigModule, DatabaseModule, UsersModule],
})
export class CreateAdminModule {}
