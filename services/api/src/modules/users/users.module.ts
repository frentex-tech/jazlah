import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * The users module: users and the staff access granted to them (UsersService). No
 * controller yet: profiles and the administration of access come with later tasks.
 */
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
