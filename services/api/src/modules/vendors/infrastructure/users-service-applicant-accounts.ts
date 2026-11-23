import { Injectable } from '@nestjs/common';
import { UsersService } from '@modules/users';
import type { ApplicantAccounts } from '../domain/ports/applicant-accounts.port';

/** Applicants' accounts through UsersService, which owns `users`. */
@Injectable()
export class UsersServiceApplicantAccounts implements ApplicantAccounts {
  constructor(private readonly users: UsersService) {}

  async holdLive(userId: string): Promise<boolean> {
    return (await this.users.lockForShare(userId)) !== null;
  }
}
