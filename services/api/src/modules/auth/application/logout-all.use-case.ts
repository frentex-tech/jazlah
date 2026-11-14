import { Inject, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import {
  AUTH_SESSION_REPOSITORY,
  type AuthSessionRepository,
} from '../domain/ports/auth-session.repository.port';
import { CLOCK, type Clock } from '../domain/ports/clock.port';

/**
 * Signs the user out of every session of the audience they are signed in as, the
 * current one included. Sessions of their other audiences are untouched: a customer
 * signing out everywhere does not end the same person's admin sessions.
 */
@Injectable()
export class LogoutAllUseCase {
  constructor(
    @Inject(AUTH_SESSION_REPOSITORY)
    private readonly sessions: AuthSessionRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(user: AuthenticatedUser): Promise<void> {
    await this.sessions.revokeAllOf(
      user.userId,
      user.audience,
      'logout_all',
      this.clock.now(),
    );
  }
}
