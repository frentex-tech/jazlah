import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * The users module: the identity of every user and the staff access granted to them
 * (UsersService), with the row locks other modules take on a user and the tombstone of
 * a deleted account. No controller: a customer's profile is the customers module's, and
 * the administration of access comes with a later task.
 */
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
