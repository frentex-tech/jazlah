import { Logger } from '@nestjs/common';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { ErrorCode } from '@common/errors/error-code.enum';
import { RECENT_SIGN_IN_SECONDS } from '../domain/recent-sign-in.constants';
import { buildAuthUseCases } from './auth-use-cases.fake';

/** Obviously fictitious numbers. */
const PHONE = '+966512345678';
const ORGANISATION = '11111111-1111-4111-8111-111111111111';
const CODE = '482913';

type Kit = ReturnType<typeof buildAuthUseCases>;

/** A whole customer sign-in through the use cases: the principal of the new session. */
async function signIn(kit: Kit, phone = PHONE): Promise<AuthenticatedUser> {
  kit.codes.nextCodes = [CODE];
  await kit.requestOtp.execute({ phone, audience: 'customer', language: 'ar' });
  await kit.detached.settle();
  const { principal } = await kit.verifyOtp.execute({
    phone,
    audience: 'customer',
    code: CODE,
    devicePlatform: 'ios',
    deviceName: 'Test phone',
  });
  return {
    userId: principal.userId,
    sessionId: principal.sessionId,
    audience: principal.audience,
    organisationId: principal.organisationId,
  };
}

async function codeOf(work: Promise<unknown>): Promise<unknown> {
  return work.then(
    () => 'no error',
    (error: unknown) => (error as { code?: unknown }).code,
  );
}

describe('DeleteCustomerAccountUseCase', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deletes the account: erasures, sessions, codes, tombstone and audit entry, in one transaction', async () => {
    const kit = buildAuthUseCases();
    const principal = await signIn(kit);
    await kit.refreshTokens.create({
      sessionId: principal.sessionId,
      tokenHash: 'second-hash',
      expiresAt: kit.clock.now(),
    });

    await kit.deleteCustomerAccount.execute({
      principal,
      reason: 'not_using',
    });

    expect(kit.users.locks).toEqual([
      `sign-in ${principal.userId}`,
      `write ${principal.userId}`,
    ]);
    expect(kit.erasures.rows).toEqual([
      `applicant ${principal.userId}`,
      `customer ${principal.userId}`,
    ]);
    expect(kit.sessions.rows).toEqual([]);
    expect(kit.challenges.rows).toEqual([]);
    expect(kit.users.users).toEqual([]);
    expect(kit.users.deleted.get(principal.userId)).toEqual(kit.clock.now());
    expect(kit.audit.rows).toEqual([
      {
        actorId: principal.userId,
        action: 'auth.account.deleted',
        entity: 'user',
        entityId: principal.userId,
        metadata: { reason: 'not_using' },
      },
    ]);
  });

  it('ends the sessions of every audience of the user, and of no one else', async () => {
    const kit = buildAuthUseCases();
    const principal = await signIn(kit);
    const other = await signIn(kit, '+966511112222');
    await kit.sessions.create({
      userId: principal.userId,
      audience: 'vendor',
      organisationId: ORGANISATION,
      deviceName: null,
      devicePlatform: 'web',
      lastUsedAt: kit.clock.now(),
      createdAt: kit.clock.now(),
    });

    await kit.deleteCustomerAccount.execute({ principal, reason: null });

    expect(kit.sessions.rows.map((row) => row.userId)).toEqual([other.userId]);
  });

  it('frees the phone: the next sign-in is a new user', async () => {
    const kit = buildAuthUseCases();
    const principal = await signIn(kit);
    await kit.deleteCustomerAccount.execute({ principal, reason: null });

    const again = await signIn(kit);

    expect(again.userId).not.toBe(principal.userId);
  });

  it(`deletes ${RECENT_SIGN_IN_SECONDS} seconds after the sign-in`, async () => {
    const kit = buildAuthUseCases();
    const principal = await signIn(kit);
    kit.clock.advanceSeconds(RECENT_SIGN_IN_SECONDS);

    await kit.deleteCustomerAccount.execute({ principal, reason: null });

    expect(kit.users.users).toEqual([]);
  });

  it('refuses a sign-in older than that with RECENT_SIGN_IN_REQUIRED, changing nothing', async () => {
    const kit = buildAuthUseCases();
    const principal = await signIn(kit);
    kit.clock.advanceSeconds(RECENT_SIGN_IN_SECONDS + 1);

    expect(
      await codeOf(
        kit.deleteCustomerAccount.execute({ principal, reason: null }),
      ),
    ).toBe(ErrorCode.RECENT_SIGN_IN_REQUIRED);
    expect(kit.users.users).toHaveLength(1);
    expect(kit.sessions.rows).toHaveLength(1);
    expect(kit.erasures.rows).toEqual([]);
    expect(kit.audit.rows).toEqual([]);
  });

  it('refuses a session that was signed out with RECENT_SIGN_IN_REQUIRED', async () => {
    const kit = buildAuthUseCases();
    const principal = await signIn(kit);
    await kit.sessions.revoke(principal.sessionId, 'logout', kit.clock.now());

    expect(
      await codeOf(
        kit.deleteCustomerAccount.execute({ principal, reason: null }),
      ),
    ).toBe(ErrorCode.RECENT_SIGN_IN_REQUIRED);
  });

  it('refuses staff access with ACCOUNT_HAS_STAFF_ACCESS before looking at the sign-in, changing nothing', async () => {
    const kit = buildAuthUseCases();
    const principal = await signIn(kit);
    kit.users.grant(PHONE, 'vendor', ORGANISATION);
    kit.clock.advanceSeconds(RECENT_SIGN_IN_SECONDS + 1);

    expect(
      await codeOf(
        kit.deleteCustomerAccount.execute({ principal, reason: null }),
      ),
    ).toBe(ErrorCode.ACCOUNT_HAS_STAFF_ACCESS);
    expect(kit.users.users).toHaveLength(1);
    expect(kit.erasures.rows).toEqual([]);
  });

  it('deletes once the staff access is removed', async () => {
    const kit = buildAuthUseCases();
    const principal = await signIn(kit);
    kit.users.grant(PHONE, 'admin', null);
    kit.users.deactivate(principal.userId, 'admin');

    await kit.deleteCustomerAccount.execute({ principal, reason: null });

    expect(kit.users.users).toEqual([]);
  });

  it('refuses a disabled account with ACCOUNT_DISABLED: such a deletion goes through support', async () => {
    const kit = buildAuthUseCases();
    const principal = await signIn(kit);
    kit.users.disable(principal.userId, kit.clock.now());

    expect(
      await codeOf(
        kit.deleteCustomerAccount.execute({ principal, reason: null }),
      ),
    ).toBe(ErrorCode.ACCOUNT_DISABLED);
    expect(kit.erasures.rows).toEqual([]);
  });

  it('answers a repeat with UNAUTHORIZED: the account is gone', async () => {
    const kit = buildAuthUseCases();
    const principal = await signIn(kit);
    await kit.deleteCustomerAccount.execute({ principal, reason: null });

    expect(
      await codeOf(
        kit.deleteCustomerAccount.execute({ principal, reason: null }),
      ),
    ).toBe(ErrorCode.UNAUTHORIZED);
  });

  it("refuses another user's session with RECENT_SIGN_IN_REQUIRED", async () => {
    const kit = buildAuthUseCases();
    const principal = await signIn(kit);
    const other = await signIn(kit, '+966511112222');

    expect(
      await codeOf(
        kit.deleteCustomerAccount.execute({
          principal: { ...principal, sessionId: other.sessionId },
          reason: null,
        }),
      ),
    ).toBe(ErrorCode.RECENT_SIGN_IN_REQUIRED);
  });
});
