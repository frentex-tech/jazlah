import { Logger } from '@nestjs/common';
import type { Audience } from '@common/auth/audience.type';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { buildAuthUseCases } from './auth-use-cases.fake';

const PHONE = '+966512345678';
const OTHER_PHONE = '+966511112222';
const CODE = '482913';

type Kit = ReturnType<typeof buildAuthUseCases>;

async function signIn(
  kit: Kit,
  phone: string,
  audience: Audience,
): Promise<AuthenticatedUser> {
  kit.codes.nextCodes = [CODE];
  await kit.requestOtp.execute({ phone, audience, language: 'ar' });
  await kit.detached.settle();
  const { principal } = await kit.verifyOtp.execute({
    phone,
    audience,
    code: CODE,
    devicePlatform: 'ios',
    deviceName: null,
  });
  kit.clock.advanceSeconds(60);
  return principal;
}

describe('LogoutAllUseCase', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('revokes every session of the user for the audience, the current one included', async () => {
    const kit = buildAuthUseCases();
    await signIn(kit, PHONE, 'customer');
    const current = await signIn(kit, PHONE, 'customer');

    await kit.logoutAll.execute(current);

    expect(kit.sessions.rows).toHaveLength(2);
    for (const session of kit.sessions.rows) {
      expect(session).toMatchObject({
        revokedAt: kit.clock.now(),
        revocationReason: 'logout_all',
      });
    }
  });

  it('leaves the same user’s sessions of another audience alone', async () => {
    const kit = buildAuthUseCases();
    kit.users.grant(PHONE, 'admin', null);
    const admin = await signIn(kit, PHONE, 'admin');
    const customer = await signIn(kit, PHONE, 'customer');

    await kit.logoutAll.execute(customer);

    expect(kit.sessions.byId(admin.sessionId)?.isActive).toBe(true);
    expect(kit.sessions.byId(customer.sessionId)?.isActive).toBe(false);
  });

  it('leaves other users alone', async () => {
    const kit = buildAuthUseCases();
    const other = await signIn(kit, OTHER_PHONE, 'customer');
    const mine = await signIn(kit, PHONE, 'customer');

    await kit.logoutAll.execute(mine);

    expect(kit.sessions.byId(other.sessionId)?.isActive).toBe(true);
  });

  it('keeps the reason of a session that had already ended', async () => {
    const kit = buildAuthUseCases();
    kit.codes.nextCodes = [CODE];
    await kit.requestOtp.execute({
      phone: PHONE,
      audience: 'customer',
      language: 'ar',
    });
    const { tokens, principal } = await kit.verifyOtp.execute({
      phone: PHONE,
      audience: 'customer',
      code: CODE,
      devicePlatform: 'ios',
      deviceName: null,
    });
    await kit.logout.execute(tokens.refreshToken);

    await kit.logoutAll.execute(principal);

    expect(kit.sessions.rows[0]?.revocationReason).toBe('logout');
  });
});
