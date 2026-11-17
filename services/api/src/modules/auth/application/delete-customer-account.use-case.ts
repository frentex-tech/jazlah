import { Inject, Injectable, Logger } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { AUTH_AUDIT } from '../domain/auth-audit-actions.constants';
import {
  APPLICANT_DATA,
  type ApplicantData,
} from '../domain/ports/applicant-data.port';
import {
  AUTH_SESSION_REPOSITORY,
  type AuthSessionRepository,
} from '../domain/ports/auth-session.repository.port';
import { CLOCK, type Clock } from '../domain/ports/clock.port';
import {
  CUSTOMER_DATA,
  type CustomerData,
} from '../domain/ports/customer-data.port';
import {
  OTP_CHALLENGE_REPOSITORY,
  type OtpChallengeRepository,
} from '../domain/ports/otp-challenge.repository.port';
import {
  USER_ACCOUNTS,
  type UserAccounts,
} from '../domain/ports/user-accounts.port';
import type { DeleteCustomerAccountInput } from './delete-customer-account-input.type';

/**
 * A customer deletes their own account, at once (FR-ACC-05, NFR-PRV). One transaction,
 * in this order:
 *
 * 1. The user's row is locked (UserAccounts.lockForWrite), so every write to what the
 *    customer keeps, and every sign-in of this user, waits for the outcome. No user (a
 *    repeat after success) is UNAUTHORIZED; a disabled user is ACCOUNT_DISABLED: such a
 *    deletion goes through support, or deleting and signing up again would get around a
 *    ban.
 * 2. Any active vendor, kitchen or admin access: ACCOUNT_HAS_STAFF_ACCESS, until that
 *    access is removed. Checked before the sign-in, since signing in again cannot help.
 * 3. The session of the request must be active and signed in within
 *    RECENT_SIGN_IN_SECONDS (AuthSession.isRecentSignIn), or RECENT_SIGN_IN_REQUIRED:
 *    the app signs the customer in again.
 * 4. What they gave when applying to become a vendor (ApplicantData), then what they keep
 *    as a customer (CustomerData: profile and addresses deleted, the consent history
 *    kept and ended withdrawn).
 * 5. Every session of the user, in every audience, with its refresh tokens, and every
 *    verification challenge of the phone.
 * 6. The user becomes a tombstone: no phone, so the number signs up again as a new user
 *    with nothing of the old one.
 * 7. The audit entry: ids and the reason's code only.
 *
 * Any refusal or failure rolls all of it back. Nothing outside the database happens
 * inside: uploaded files leave storage through the media cleanup job after the commit.
 * The access token keeps working until it expires, but every customer endpoint that
 * reads or writes the user then answers UNAUTHORIZED.
 */
@Injectable()
export class DeleteCustomerAccountUseCase {
  private readonly logger = new Logger(DeleteCustomerAccountUseCase.name);

  constructor(
    @Inject(USER_ACCOUNTS) private readonly users: UserAccounts,
    @Inject(AUTH_SESSION_REPOSITORY)
    private readonly sessions: AuthSessionRepository,
    @Inject(OTP_CHALLENGE_REPOSITORY)
    private readonly challenges: OtpChallengeRepository,
    @Inject(CUSTOMER_DATA) private readonly customers: CustomerData,
    @Inject(APPLICANT_DATA) private readonly applicants: ApplicantData,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    @Inject(CLOCK) private readonly clock: Clock,
    // Narrowed to what is used, so a unit test passes a plain object.
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(input: DeleteCustomerAccountInput): Promise<void> {
    const { principal } = input;
    const now = this.clock.now();
    await this.transactions.run(async () => {
      const user = await this.users.lockForWrite(principal.userId);
      if (user === null) {
        throw new AppError(ErrorCode.UNAUTHORIZED);
      }
      if (user.disabledAt !== null) {
        throw new AppError(ErrorCode.ACCOUNT_DISABLED);
      }
      if (await this.users.hasActiveStaffAccess(user.id)) {
        throw new AppError(ErrorCode.ACCOUNT_HAS_STAFF_ACCESS);
      }
      const session = await this.sessions.findById(principal.sessionId);
      if (
        session === null ||
        session.userId !== user.id ||
        !session.isRecentSignIn(now)
      ) {
        throw new AppError(ErrorCode.RECENT_SIGN_IN_REQUIRED);
      }

      await this.applicants.eraseOf(user.id);
      await this.customers.eraseOf(user.id);
      await this.sessions.deleteAllOf(user.id);
      await this.challenges.deleteAllOf(user.phone);
      await this.users.markDeleted(user.id, now);
      await this.audit.write({
        actorId: user.id,
        ...AUTH_AUDIT.accountDeleted,
        entityId: user.id,
        metadata: { reason: input.reason },
      });
    });
    this.logger.log({ userId: principal.userId }, 'Account deleted');
  }
}
