import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { VENDOR_STATUS_CHECKER } from '@common/auth/vendor-status-checker.constants';
import type { VendorStatusChecker } from '@common/auth/vendor-status-checker.interface';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { authConfig } from '@config/auth.config';
import type { AuthConfig } from '@config/auth-config.type';
import { TransactionRunner } from '@infra/database/transaction-runner';
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
  OTP_CHALLENGE_REPOSITORY,
  type OtpChallengeRepository,
} from '../domain/ports/otp-challenge.repository.port';
import { OTP_CODES, type OtpCodes } from '../domain/ports/otp-codes.port';
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
import type { UserAccount } from '../domain/user-account.type';
import type { SignedIn } from './signed-in.type';
import type { VerifyOtpInput } from './verify-otp-input.type';

/**
 * Exchanges a verification code for a session: the sign-in.
 *
 * In order:
 * 1. The newest challenge of the phone and audience must be usable (OtpChallenge);
 *    otherwise OTP_EXPIRED.
 * 2. An attempt is claimed before the code is looked at, in its own committed
 *    statement. So the attempt limit holds however many requests arrive at once, and a
 *    wrong code can never be rolled back.
 * 3. A wrong code is OTP_INVALID. A staff request without access always ends here: its
 *    stored hash matches nothing.
 * 4. A correct code, in one transaction: the challenge is consumed (a code works
 *    once); the user is found (created, for a customer's first sign-in); a staff
 *    audience needs active access, without which the answer is OTP_INVALID, the same
 *    as a wrong code; a disabled user gets ACCOUNT_DISABLED, which only the owner of
 *    the phone can ever see, since it takes the code; a vendor whose vendor is
 *    suspended (or with no VendorStatusChecker bound) gets VENDOR_SUSPENDED, likewise
 *    only after a correct code; the session and its first refresh token are stored. Any refusal rolls all of it back: the code is not
 *    consumed, the attempt stays counted.
 * 5. After the commit the access token is signed. Nothing outside the database happens
 *    inside the transaction.
 */
@Injectable()
export class VerifyOtpUseCase {
  private readonly logger = new Logger(VerifyOtpUseCase.name);

  constructor(
    @Inject(OTP_CHALLENGE_REPOSITORY)
    private readonly challenges: OtpChallengeRepository,
    @Inject(OTP_CODES) private readonly codes: OtpCodes,
    @Inject(USER_ACCOUNTS) private readonly users: UserAccounts,
    @Inject(AUTH_SESSION_REPOSITORY)
    private readonly sessions: AuthSessionRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokens: RefreshTokenRepository,
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
      | 'otpMaxAttempts'
      | 'accessTokenTtlSeconds'
      | 'refreshTokenTtlSeconds'
      | 'reviewAccounts'
    >,
    // Bound by the vendors module; without it no vendor can sign in.
    @Optional()
    @Inject(VENDOR_STATUS_CHECKER)
    private readonly vendors?: VendorStatusChecker,
  ) {}

  async execute(input: VerifyOtpInput): Promise<SignedIn> {
    const { phone, audience } = input;
    const now = this.clock.now();

    const challenge = await this.challenges.findNewest(phone, audience);
    if (
      challenge === null ||
      challenge.state(now, this.config.otpMaxAttempts) !== 'usable' ||
      !(await this.challenges.claimAttempt(
        challenge.id,
        this.config.otpMaxAttempts,
        now,
      ))
    ) {
      throw new AppError(ErrorCode.OTP_EXPIRED);
    }
    if (
      !this.codes.matches({ phone, audience }, input.code, challenge.codeHash)
    ) {
      throw new AppError(ErrorCode.OTP_INVALID);
    }

    const refresh = this.secrets.generate();
    const signedIn = await this.transactions.run(async () => {
      if (!(await this.challenges.consume(challenge.id, now))) {
        throw new AppError(ErrorCode.OTP_EXPIRED);
      }
      const { user, organisationId } = await this.resolveUser(input);
      if (user.disabledAt !== null) {
        throw new AppError(ErrorCode.ACCOUNT_DISABLED);
      }
      if (
        audience === 'vendor' &&
        (organisationId === null || (await this.isSuspended(organisationId)))
      ) {
        throw new AppError(ErrorCode.VENDOR_SUSPENDED);
      }
      const session = await this.sessions.create({
        userId: user.id,
        audience,
        organisationId,
        deviceName: input.deviceName,
        devicePlatform: input.devicePlatform,
        lastUsedAt: now,
      });
      await this.refreshTokens.create({
        sessionId: session.id,
        tokenHash: refresh.hash,
        expiresAt: new Date(
          now.getTime() + this.config.refreshTokenTtlSeconds * 1000,
        ),
      });
      const principal: AuthenticatedUser = {
        userId: user.id,
        sessionId: session.id,
        audience,
        organisationId,
      };
      return principal;
    });

    const accessToken = await this.accessTokens.sign(signedIn, now);
    const isReviewAccount = this.config.reviewAccounts.some(
      (account) => account.phone === phone,
    );
    const fields = {
      userId: signedIn.userId,
      sessionId: signedIn.sessionId,
      audience,
    };
    if (isReviewAccount) {
      this.logger.warn(fields, 'Signed in with a review account');
    } else {
      this.logger.log(fields, 'Signed in');
    }
    return {
      tokens: {
        accessToken,
        accessTokenExpiresInSeconds: this.config.accessTokenTtlSeconds,
        refreshToken: refresh.token,
        refreshTokenExpiresInSeconds: this.config.refreshTokenTtlSeconds,
      },
      principal: { ...signedIn, phone },
    };
  }

  /** Whether the vendor is suspended; true while no VendorStatusChecker is bound. */
  private async isSuspended(vendorId: string): Promise<boolean> {
    return this.vendors === undefined || this.vendors.isSuspended(vendorId);
  }

  /**
   * The user signing in and, for staff, the organisation of their access. A staff
   * audience without active access is refused exactly like a wrong code.
   */
  private async resolveUser(
    input: VerifyOtpInput,
  ): Promise<{ user: UserAccount; organisationId: string | null }> {
    if (input.audience === 'customer') {
      return {
        user: await this.users.findOrCreateByPhone(input.phone),
        organisationId: null,
      };
    }
    const user = await this.users.findByPhone(input.phone);
    const organisationId =
      user === null
        ? undefined
        : await this.users.findStaffOrganisation(user.id, input.audience);
    if (user === null || organisationId === undefined) {
      throw new AppError(ErrorCode.OTP_INVALID);
    }
    return { user, organisationId };
  }
}
