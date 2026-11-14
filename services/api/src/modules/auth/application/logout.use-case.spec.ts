import { Logger } from '@nestjs/common';
import { buildAuthUseCases } from './auth-use-cases.fake';

const PHONE = '+966512345678';
const CODE = '482913';

type Kit = ReturnType<typeof buildAuthUseCases>;

async function signIn(kit: Kit): Promise<string> {
  kit.codes.nextCodes = [CODE];
  await kit.requestOtp.execute({
    phone: PHONE,
    audience: 'customer',
    language: 'ar',
  });
  const { tokens } = await kit.verifyOtp.execute({
    phone: PHONE,
    audience: 'customer',
    code: CODE,
    devicePlatform: 'android',
    deviceName: null,
  });
  kit.clock.advanceSeconds(60);
  return tokens.refreshToken;
}

describe('LogoutUseCase', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('revokes the session the refresh token belongs to', async () => {
    const kit = buildAuthUseCases();
    const token = await signIn(kit);

    await kit.logout.execute(token);

    expect(kit.sessions.rows[0]).toMatchObject({
      revokedAt: kit.clock.now(),
      revocationReason: 'logout',
    });
  });

  it('leaves the other sessions of the same user alone', async () => {
    const kit = buildAuthUseCases();
    const first = await signIn(kit);
    await signIn(kit);

    await kit.logout.execute(first);

    expect(kit.sessions.rows.map((row) => row.isActive)).toEqual([false, true]);
  });

  it('says nothing about an unknown token', async () => {
    const kit = buildAuthUseCases();
    await signIn(kit);

    await expect(kit.logout.execute('not-a-token')).resolves.toBeUndefined();
    expect(kit.sessions.rows[0]?.isActive).toBe(true);
  });

  it('is the same done twice: the first time and reason stay', async () => {
    const kit = buildAuthUseCases();
    const token = await signIn(kit);
    await kit.logout.execute(token);
    const revokedAt = kit.sessions.rows[0]?.revokedAt;
    kit.clock.advanceSeconds(30);

    await expect(kit.logout.execute(token)).resolves.toBeUndefined();

    expect(kit.sessions.rows[0]?.revokedAt).toEqual(revokedAt);
  });

  it('works with a refresh token that was already exchanged', async () => {
    const kit = buildAuthUseCases();
    const first = await signIn(kit);
    await kit.refreshSession.execute(first);

    await kit.logout.execute(first);

    expect(kit.sessions.rows[0]?.revocationReason).toBe('logout');
  });
});
