import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { ErrorCode } from '@common/errors/error-code.enum';
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

describe('GetCurrentUserUseCase', () => {
  it('returns what the token says, with the phone of the user', async () => {
    const kit = buildAuthUseCases();
    const user = kit.users.add(PHONE);

    expect(await kit.getCurrentUser.execute(principalOf(user.id))).toEqual({
      ...principalOf(user.id),
      phone: PHONE,
    });
  });

  it('refuses a disabled user with ACCOUNT_DISABLED', async () => {
    const kit = buildAuthUseCases();
    const user = kit.users.add(PHONE);
    kit.users.disable(user.id, kit.clock.now());

    await expect(
      kit.getCurrentUser.execute(principalOf(user.id)),
    ).rejects.toMatchObject({ code: ErrorCode.ACCOUNT_DISABLED });
  });

  it('refuses a user who no longer exists with UNAUTHORIZED', async () => {
    const kit = buildAuthUseCases();

    await expect(
      kit.getCurrentUser.execute(principalOf('user-9')),
    ).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED });
  });
});
