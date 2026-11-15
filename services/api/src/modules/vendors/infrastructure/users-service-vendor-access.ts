import { Injectable } from '@nestjs/common';
import { UsersService } from '@modules/users';
import type { VendorAccess } from '../domain/ports/vendor-access.port';

/** Vendor access through UsersService, which owns `user_access`. */
@Injectable()
export class UsersServiceVendorAccess implements VendorAccess {
  constructor(private readonly users: UsersService) {}

  grant(userId: string, vendorId: string): Promise<void> {
    return this.users.grantVendorAccess(userId, vendorId);
  }
}
