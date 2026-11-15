import { Inject, Injectable, Logger } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { authConfig } from '@config/auth.config';
import type { AuthConfig } from '@config/auth-config.type';
import { TransactionRunner } from '@infra/database/transaction-runner';
import type { AuthSession } from '../domain/auth-session.entity';
import type { AuthTokens } from '../domain/auth-tokens.type';
import {
  ACCESS_TOKENS,
  type AccessTokens,
} from '../domain/ports/access-tokens.port';
import {
  AUTH_SESSION_REPOSITORY,
  type AuthSessionRepository,
} from '../domain/ports/auth-session.repository.port';
import { CLOCK, type Clock } from '../domain/ports/clock.port';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../domain/ports/refresh-token.repository.port';
import {
  REFRESH_TOKEN_SECRETS,
  type RefreshTokenSecrets,
} from '../domain/ports/refresh-token-secrets.port';
import {
  USER_ACCOUNTS,
  type UserAccounts,
} from '../domain/ports/user-accounts.port';
import type { RefreshToken } from '../domain/refresh-token.entity';
import type { RefreshOutcome } from './refresh-outcome.type';

/**
 * Exchanges a refresh token for a new pair: rotation. Each token is exchanged once.
 *
 * One transaction decides and returns an outcome, never throwing, so a revocation it
 * makes is committed before the client is refused:
 * - a revoked session, or a token that expired unused: invalid, nothing written;
 * - a token that was already exchanged (also when another request exchanges it at the
 *   same moment): reuse. Two parties hold the token, so the whole session is revoked
 *   and both lose it. Strict on purpose: a client that lost the answer to a refresh
 *   signs in again;
 * - the user is gone or disabled, or, for a staff session, the access is no longer
 *   active for the session's organisation: the session is revoked;
 * - otherwise the token is marked used, its successor stored, and the session's
 *   last-used time updated.
 *
 * After the commit: ACCOUNT_DISABLED for a disabled user, REFRESH_TOKEN_INVALID for
 * every other refusal, or a new access token carrying the session's single audience
 * and organisation.
 */
@Injectable()
export class RefreshSessionUseCase {
  private readonly logger = new Logger(RefreshSessionUseCase.name);

  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokens: RefreshTokenRepository,
    @Inject(AUTH_SESSION_REPOSITORY)
    private readonly sessions: AuthSessionRepository,
    @Inject(USER_ACCOUNTS) private readonly users: UserAccounts,
    @Inject(REFRESH_TOKEN_SECRETS)
    private readonly secrets: RefreshTokenSecrets,
    @Inject(ACCESS_TOKENS) private readonly accessTokens: AccessTokens,
    @Inject(CLOCK) private readonly clock: Clock,
    // Narrowed to what is used, so a unit test passes a plain object.
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
    @Inject(authConfig.KEY)
    private readonly config: Pick<
      AuthConfig,
      'accessTokenTtlSeconds' | 'refreshTokenTtlSeconds'
    >,
  ) {}

  async execute(refreshToken: string): Promise<AuthTokens> {
    const now = this.clock.now();
    const found = await this.refreshTokens.findByHash(
      this.secrets.hash(refreshToken),
    );
    if (found === null) {
      throw new AppError(ErrorCode.REFRESH_TOKEN_INVALID);
    }
    const { token, session } = found;
    const successor = this.secrets.generate();

    const outcome = await this.transactions.run(() =>
      this.rotate(token, session, successor.hash, now),
    );

    if (outcome.kind === 'disabled') {
      throw new AppError(ErrorCode.ACCOUNT_DISABLED);
    }
    if (outcome.kind !== 'rotated') {
      if (outcome.kind === 'reused') {
        this.logger.warn(
          { sessionId: session.id, userId: session.userId },
          'Refresh token reuse detected: session revoked',
        );
      }
      throw new AppError(ErrorCode.REFRESH_TOKEN_INVALID);
    }
    return {
      accessToken: await this.accessTokens.sign(outcome.user, now),
      accessTokenExpiresInSeconds: this.config.accessTokenTtlSeconds,
      refreshToken: successor.token,
      refreshTokenExpiresInSeconds: this.config.refreshTokenTtlSeconds,
    };
  }

  private async rotate(
    token: RefreshToken,
    session: AuthSession,
    successorHash: string,
    now: Date,
  ): Promise<RefreshOutcome> {
    if (!session.isActive) {
      return { kind: 'invalid' };
    }
    const state = token.state(now);
    if (state === 'expired') {
      return { kind: 'invalid' };
    }
    if (
      state === 'used' ||
      !(await this.refreshTokens.markUsed(token.id, now))
    ) {
      await this.sessions.revoke(session.id, 'reuse_detected', now);
      return { kind: 'reused' };
    }

    const user = await this.users.findById(session.userId);
    if (user === null || user.disabledAt !== null) {
      await this.sessions.revoke(session.id, 'access_lost', now);
      return { kind: user === null ? 'invalid' : 'disabled' };
    }
    if (
      session.audience !== 'customer' &&
      (await this.users.findStaffOrganisation(user.id, session.audience)) !==
        session.organisationId
    ) {
      await this.sessions.revoke(session.id, 'access_lost', now);
      return { kind: 'invalid' };
    }

    await this.refreshTokens.create({
      sessionId: session.id,
      tokenHash: successorHash,
      expiresAt: new Date(
        now.getTime() + this.config.refreshTokenTtlSeconds * 1000,
      ),
    });
    await this.sessions.touch(session.id, now);
    return {
      kind: 'rotated',
      user: {
        userId: user.id,
        sessionId: session.id,
        audience: session.audience,
        organisationId: session.organisationId,
      },
    };
  }
}
