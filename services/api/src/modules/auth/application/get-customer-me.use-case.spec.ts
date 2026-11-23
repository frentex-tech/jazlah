import { ErrorCode } from '@common/errors/error-code.enum';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { buildAuthUseCases } from './auth-use-cases.fake';

const PHONE = '+966512345678';

function principalOf(userId: string): AuthenticatedUser {
  return {
    userId,
    sessionId: 'session-1',
    audience: 'customer',
    organisationId: null,
  };
}

describe('GetCustomerMeUseCase', () => {
  it('returns the principal, the phone in full, and the profile with its consent', async () => {
    const kit = buildAuthUseCases();
    const user = kit.users.add(PHONE);
    kit.profiles.name(user.id, 'محمد');

    const me = await kit.getCustomerMe.execute(principalOf(user.id));

    expect(me).toEqual({
      ...principalOf(user.id),
      phone: PHONE,
      profile: {
        fullName: 'محمد',
        email: null,
        preferredLanguage: 'ar',
        isComplete: true,
        marketingConsent: { granted: false, changedAt: null },
      },
    });
  });

  it('says a profile without a name is incomplete', async () => {
    const kit = buildAuthUseCases();
    const user = kit.users.add(PHONE);

    const me = await kit.getCustomerMe.execute(principalOf(user.id));

    expect(me.profile.isComplete).toBe(false);
  });

  it('refuses a deleted account with UNAUTHORIZED (its access token outlives it)', async () => {
    const kit = buildAuthUseCases();
    const user = kit.users.add(PHONE);
    await kit.users.markDeleted(user.id, kit.clock.now());

    await expect(
      kit.getCustomerMe.execute(principalOf(user.id)),
    ).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED });
  });

  it('refuses a disabled account with ACCOUNT_DISABLED', async () => {
    const kit = buildAuthUseCases();
    const user = kit.users.add(PHONE);
    kit.users.disable(user.id, kit.clock.now());

    await expect(
      kit.getCustomerMe.execute(principalOf(user.id)),
    ).rejects.toMatchObject({ code: ErrorCode.ACCOUNT_DISABLED });
  });
});
