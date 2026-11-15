import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import type { AccessTokens } from '../ports/access-tokens.port';

/** Access tokens without signing: `access-token-1`, …, each remembered with its subject. */
export class InMemoryAccessTokens implements AccessTokens {
  readonly signed: { token: string; user: AuthenticatedUser; at: Date }[] = [];

  sign(user: AuthenticatedUser, now: Date): Promise<string> {
    const token = `access-token-${this.signed.length + 1}`;
    this.signed.push({ token, user, at: now });
    return Promise.resolve(token);
  }
}
