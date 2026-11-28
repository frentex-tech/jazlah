import type { AuthConfig } from '@config/auth-config.type';
import { InMemoryAuditLog } from '@infra/audit/in-memory-audit-log.fake';
import type { TransactionRunner } from '@infra/database/transaction-runner';
import { FixedClock } from '../domain/fakes/fixed-clock.fake';
import { InMemoryAccessTokens } from '../domain/fakes/in-memory-access-tokens.fake';
import { InMemoryAuthSessionRepository } from '../domain/fakes/in-memory-auth-session.repository.fake';
import { InMemoryCustomerProfiles } from '../domain/fakes/in-memory-customer-profiles.fake';
import { InMemoryDetachedWork } from '../domain/fakes/in-memory-detached-work.fake';
import { InMemoryErasures } from '../domain/fakes/in-memory-erasures.fake';
import { InMemoryOtpChallengeRepository } from '../domain/fakes/in-memory-otp-challenge.repository.fake';
import { InMemoryOtpCodes } from '../domain/fakes/in-memory-otp-codes.fake';
import { InMemoryOtpRequestLimit } from '../domain/fakes/in-memory-otp-request-limit.fake';
import { InMemoryOtpSender } from '../domain/fakes/in-memory-otp-sender.fake';
import { InMemoryRefreshTokenRepository } from '../domain/fakes/in-memory-refresh-token.repository.fake';
import { InMemoryRefreshTokenSecrets } from '../domain/fakes/in-memory-refresh-token-secrets.fake';
import { InMemoryUserAccounts } from '../domain/fakes/in-memory-user-accounts.fake';
import { InMemoryVendorStatusChecker } from '../domain/fakes/in-memory-vendor-status-checker.fake';
import { DeleteCustomerAccountUseCase } from './delete-customer-account.use-case';
import { GetCurrentUserUseCase } from './get-current-user.use-case';
import { GetCustomerMeUseCase } from './get-customer-me.use-case';
import { LogoutAllUseCase } from './logout-all.use-case';
import { LogoutUseCase } from './logout.use-case';
import { RefreshSessionUseCase } from './refresh-session.use-case';
import { RequestOtpUseCase } from './request-otp.use-case';
import { VerifyOtpUseCase } from './verify-otp.use-case';

/** The settings the use case tests run with: the defaults of the environment schema. */
export const TEST_AUTH_CONFIG: Pick<
  AuthConfig,
  | 'otpTtlSeconds'
  | 'otpMaxAttempts'
  | 'otpResendWaitSeconds'
  | 'accessTokenTtlSeconds'
  | 'refreshTokenTtlSeconds'
  | 'reviewAccounts'
> = {
  otpTtlSeconds: 300,
  otpMaxAttempts: 5,
  otpResendWaitSeconds: 60,
  accessTokenTtlSeconds: 900,
  refreshTokenTtlSeconds: 2_592_000,
  reviewAccounts: [],
};

/**
 * Every use case of the auth module wired to the in-memory fakes of its ports, for the
 * unit tests: no database, no Nest application. Transactions are real enough to test
 * with: when the work throws, what it wrote to the in-memory repositories and users is
 * put back, as a rollback would.
 */
export function buildAuthUseCases(
  config: Partial<typeof TEST_AUTH_CONFIG> = {},
) {
  const settings = { ...TEST_AUTH_CONFIG, ...config };
  const clock = new FixedClock('2026-11-14T09:00:00.000Z');
  const challenges = new InMemoryOtpChallengeRepository();
  const sessions = new InMemoryAuthSessionRepository();
  const refreshTokens = new InMemoryRefreshTokenRepository(sessions);
  const codes = new InMemoryOtpCodes();
  const secrets = new InMemoryRefreshTokenSecrets();
  const accessTokens = new InMemoryAccessTokens();
  const sender = new InMemoryOtpSender();
  const limit = new InMemoryOtpRequestLimit();
  const users = new InMemoryUserAccounts();
  const detached = new InMemoryDetachedWork();
  const vendors = new InMemoryVendorStatusChecker();
  const profiles = new InMemoryCustomerProfiles();
  const erasures = new InMemoryErasures();
  const audit = new InMemoryAuditLog();
  const activeOrders = {
    userIds: new Set<string>(),
    hasActiveOrders(userId: string): Promise<boolean> {
      return Promise.resolve(this.userIds.has(userId));
    },
  };

  const transactions: Pick<TransactionRunner, 'run'> = {
    async run<T>(work: () => Promise<T>): Promise<T> {
      const before = {
        challenges: challenges.rows,
        sessions: sessions.rows,
        refreshTokens: refreshTokens.rows,
        users: users.users,
        deleted: users.deleted,
        erasures: erasures.rows,
        audit: audit.rows,
      };
      try {
        return await work();
      } catch (error) {
        challenges.rows = before.challenges;
        sessions.rows = before.sessions;
        refreshTokens.rows = before.refreshTokens;
        users.users = before.users;
        users.deleted = before.deleted;
        erasures.rows = before.erasures;
        audit.rows = before.audit;
        throw error;
      }
    },
  };

  return {
    clock,
    challenges,
    sessions,
    refreshTokens,
    codes,
    secrets,
    accessTokens,
    sender,
    limit,
    users,
    detached,
    vendors,
    profiles,
    erasures,
    audit,
    activeOrders,
    requestOtp: new RequestOtpUseCase(
      challenges,
      codes,
      limit,
      sender,
      users,
      detached,
      clock,
      settings,
    ),
    verifyOtp: new VerifyOtpUseCase(
      challenges,
      codes,
      users,
      sessions,
      refreshTokens,
      secrets,
      accessTokens,
      clock,
      transactions,
      profiles,
      settings,
      vendors,
    ),
    refreshSession: new RefreshSessionUseCase(
      refreshTokens,
      sessions,
      users,
      secrets,
      accessTokens,
      clock,
      transactions,
      settings,
      vendors,
    ),
    logout: new LogoutUseCase(refreshTokens, sessions, secrets, clock),
    logoutAll: new LogoutAllUseCase(sessions, clock),
    getCurrentUser: new GetCurrentUserUseCase(users),
    getCustomerMe: new GetCustomerMeUseCase(users, profiles),
    deleteCustomerAccount: new DeleteCustomerAccountUseCase(
      users,
      activeOrders,
      sessions,
      challenges,
      erasures.customers,
      erasures.applicants,
      audit,
      clock,
      transactions,
    ),
  };
}
