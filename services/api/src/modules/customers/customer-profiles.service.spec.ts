import type { DbContext } from '@infra/database/db-context';
import { ErrorCode } from '@common/errors/error-code.enum';
import { CUSTOMER, buildCustomersKit } from './customers-test-kit.fake';

/** The services on in-memory fakes. */
const kitWithFakes = () =>
  buildCustomersKit((client) => ({ client }) as unknown as DbContext);

async function codeOf(work: Promise<unknown>): Promise<unknown> {
  return work.then(
    () => 'resolved',
    (error: unknown) => (error as { code?: unknown }).code,
  );
}

describe('CustomerProfilesService', () => {
  it('gives a customer who never saved a profile the defaults: incomplete, Arabic', async () => {
    const kit = kitWithFakes();

    expect(await kit.profiles.profileOf(CUSTOMER)).toEqual({
      fullName: null,
      email: null,
      preferredLanguage: 'ar',
      isComplete: false,
    });
    expect(kit.client.profiles).toEqual([]);
  });

  it('creates the profile at the first save, after locking the user, and a name completes it', async () => {
    const kit = kitWithFakes();

    const profile = await kit.profiles.update(CUSTOMER, { fullName: 'محمد' });

    expect(profile).toEqual({
      fullName: 'محمد',
      email: null,
      preferredLanguage: 'ar',
      isComplete: true,
    });
    expect(kit.accounts.locked).toEqual([CUSTOMER]);
    expect(await kit.profiles.profileOf(CUSTOMER)).toEqual(profile);
  });

  it('changes only the fields given, and null removes the email', async () => {
    const kit = kitWithFakes();
    await kit.profiles.update(CUSTOMER, {
      fullName: 'محمد',
      email: 'mohammed@example.com',
    });

    await kit.profiles.update(CUSTOMER, { preferredLanguage: 'en' });
    expect(await kit.profiles.profileOf(CUSTOMER)).toMatchObject({
      fullName: 'محمد',
      email: 'mohammed@example.com',
      preferredLanguage: 'en',
    });

    await kit.profiles.update(CUSTOMER, { email: null });
    expect((await kit.profiles.profileOf(CUSTOMER)).email).toBeNull();
  });

  it('does not count the email or the language toward a complete profile', async () => {
    const kit = kitWithFakes();

    const profile = await kit.profiles.update(CUSTOMER, {
      email: 'mohammed@example.com',
      preferredLanguage: 'en',
    });

    expect(profile.isComplete).toBe(false);
  });

  it('refuses a deleted account with UNAUTHORIZED and a disabled one with ACCOUNT_DISABLED, saving nothing', async () => {
    const kit = kitWithFakes();
    kit.accounts.delete(CUSTOMER);
    expect(
      await codeOf(kit.profiles.update(CUSTOMER, { fullName: 'محمد' })),
    ).toBe(ErrorCode.UNAUTHORIZED);

    const other = kitWithFakes();
    other.accounts.disable(CUSTOMER);
    expect(
      await codeOf(other.profiles.update(CUSTOMER, { fullName: 'محمد' })),
    ).toBe(ErrorCode.ACCOUNT_DISABLED);

    expect([...kit.client.profiles, ...other.client.profiles]).toEqual([]);
  });

  it('erases the profile', async () => {
    const kit = kitWithFakes();
    await kit.profiles.update(CUSTOMER, { fullName: 'محمد' });

    await kit.profiles.eraseOf(CUSTOMER);

    expect(kit.client.profiles).toEqual([]);
    expect((await kit.profiles.profileOf(CUSTOMER)).isComplete).toBe(false);
  });
});
