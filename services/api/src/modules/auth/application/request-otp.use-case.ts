import { Inject, Injectable, Logger } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { authConfig } from '@config/auth.config';
import type { AuthConfig } from '@config/auth-config.type';
import { buildOtpMessage } from '../domain/build-otp-message';
import type { OtpChallenge } from '../domain/otp-challenge.entity';
import { CLOCK, type Clock } from '../domain/ports/clock.port';
import {
  DETACHED_WORK,
  type DetachedWork,
} from '../domain/ports/detached-work.port';
import {
  OTP_CHALLENGE_REPOSITORY,
  type OtpChallengeRepository,
} from '../domain/ports/otp-challenge.repository.port';
import { OTP_CODES, type OtpCodes } from '../domain/ports/otp-codes.port';
import {
  OTP_REQUEST_LIMIT,
  type OtpRequestLimit,
} from '../domain/ports/otp-request-limit.port';
import { OTP_SENDER, type OtpSender } from '../domain/ports/otp-sender.port';
import {
  USER_ACCOUNTS,
  type UserAccounts,
} from '../domain/ports/user-accounts.port';
import type { StaffAudience } from '@common/auth/staff-audience.type';
import type { OtpRequested } from './otp-requested.type';
import type { RequestOtpInput } from './request-otp-input.type';

/**
 * Issues a verification code for a phone and an audience, and sends it by SMS.
 *
 * In order:
 * 1. The resend wait: a code issued less than AUTH_OTP_RESEND_WAIT_SECONDS ago for the
 *    same phone and audience refuses the request (RATE_LIMITED with the time left). A
 *    refused resend does not count against the phone's limits.
 * 2. The phone's limits for this audience (OtpRequestLimit), which fail closed; counted
 *    before access is looked up, so the same with and without staff access.
 * 3. What is stored, one row in every case, so every request behaves alike afterwards:
 *    - a staff audience and a phone without active access: a hash no code matches, and
 *      no SMS. The answer, the resend wait and the attempts are those of a real
 *      request, so nobody can learn which phones are staff;
 *    - a review account: the hash of its fixed code, and no SMS;
 *    - otherwise: the hash of a new random code, and an SMS.
 * 4. The SMS goes out after the row is stored, never inside a transaction.
 *    - Customer: the request waits for it. If it fails the row is deleted, so the
 *      previous code works again and the client may retry at once, and the failure
 *      reaches the client (503 when retryable).
 *    - Staff: the request does not wait (DetachedWork), so the time it takes is the
 *      same with and without access. A failure is logged at error and the row made
 *      unverifiable, not deleted: it stays the newest, so the resend wait applies
 *      exactly as for a phone without access, and an SMS outage reveals nothing.
 *
 * The code and the phone never reach the log: only the challenge id.
 */
@Injectable()
export class RequestOtpUseCase {
  private readonly logger = new Logger(RequestOtpUseCase.name);

  constructor(
    @Inject(OTP_CHALLENGE_REPOSITORY)
    private readonly challenges: OtpChallengeRepository,
    @Inject(OTP_CODES) private readonly codes: OtpCodes,
    @Inject(OTP_REQUEST_LIMIT) private readonly limit: OtpRequestLimit,
    @Inject(OTP_SENDER) private readonly sender: OtpSender,
    @Inject(USER_ACCOUNTS) private readonly users: UserAccounts,
    @Inject(DETACHED_WORK) private readonly detached: DetachedWork,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(authConfig.KEY)
    private readonly config: Pick<
      AuthConfig,
      'otpTtlSeconds' | 'otpResendWaitSeconds' | 'reviewAccounts'
    >,
  ) {}

  async execute(input: RequestOtpInput): Promise<OtpRequested> {
    const { phone, audience } = input;
    const now = this.clock.now();

    const previous = await this.challenges.findNewest(phone, audience);
    const wait =
      previous?.resendWaitSeconds(now, this.config.otpResendWaitSeconds) ?? 0;
    if (wait > 0) {
      throw new AppError(ErrorCode.RATE_LIMITED, { retryAfterSeconds: wait });
    }
    await this.limit.consume(phone, audience);

    const verifiable =
      audience === 'customer' || (await this.hasStaffAccess(phone, audience));
    const reviewCode = this.config.reviewAccounts.find(
      (account) => account.phone === phone,
    )?.code;
    const code = reviewCode ?? this.codes.generate();
    const challenge = await this.challenges.create({
      phone,
      audience,
      codeHash: verifiable
        ? this.codes.hash({ phone, audience }, code)
        : this.codes.unmatchableHash(),
      expiresAt: new Date(now.getTime() + this.config.otpTtlSeconds * 1000),
      createdAt: now,
    });

    if (verifiable && reviewCode === undefined) {
      const text = buildOtpMessage(code, input.language);
      if (audience === 'customer') {
        await this.sendOrDelete(challenge, text);
      } else {
        this.detached.start('otp-sms', () =>
          this.sendOrDisable(challenge, text),
        );
      }
    }
    this.logger.log(
      { challengeId: challenge.id, audience },
      'Verification code requested',
    );
    return {
      expiresInSeconds: this.config.otpTtlSeconds,
      resendAfterSeconds: this.config.otpResendWaitSeconds,
    };
  }

  private async hasStaffAccess(
    phone: string,
    audience: StaffAudience,
  ): Promise<boolean> {
    const user = await this.users.findByPhone(phone);
    if (user === null) {
      return false;
    }
    const organisation = await this.users.findStaffOrganisation(
      user.id,
      audience,
    );
    return organisation !== undefined;
  }

  /**
   * A staff code's SMS, sent detached: when it fails, the failure is logged at error and
   * the challenge made unverifiable. Never rejects: nobody is waiting for it.
   */
  private async sendOrDisable(
    challenge: OtpChallenge,
    text: string,
  ): Promise<void> {
    try {
      await this.sender.send(challenge.phone, text);
      return;
    } catch (error) {
      this.logger.error(
        { err: error, challengeId: challenge.id, audience: challenge.audience },
        'Verification code not sent',
      );
    }
    try {
      await this.challenges.makeUnverifiable(
        challenge.id,
        this.codes.unmatchableHash(),
      );
    } catch (error) {
      // The challenge then still expires, unverified, in AUTH_OTP_TTL_SECONDS.
      this.logger.error(
        { err: error, challengeId: challenge.id },
        'Could not disable the challenge of a verification code that was not sent',
      );
    }
  }

  /** Sends the message; when that fails, removes the challenge and rethrows. */
  private async sendOrDelete(
    challenge: OtpChallenge,
    text: string,
  ): Promise<void> {
    try {
      await this.sender.send(challenge.phone, text);
    } catch (error) {
      try {
        await this.challenges.delete(challenge.id);
      } catch (deleteError) {
        // The send failure is the one to report; an undeleted challenge only expires.
        this.logger.error(
          { err: deleteError, challengeId: challenge.id },
          'Could not delete the challenge of a verification code that was not sent',
        );
      }
      throw error;
    }
  }
}
