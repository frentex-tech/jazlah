import { ErrorCode } from '@common/errors/error-code.enum';
import type { DbContext } from '@infra/database/db-context';
import type { TransactionRunner } from '@infra/database/transaction-runner';
import { InMemoryUsersClient } from './in-memory-users-client.fake';
import { UsersService } from './users.service';

const PHONE = '+966512345678';

function build(): { service: UsersService; client: InMemoryUsersClient } {
  const client = new InMemoryUsersClient();
  const service = new UsersService(
    { client } as unknown as DbContext,
    {
      run: <T>(work: () => Promise<T>) => work(),
    } as unknown as TransactionRunner,
  );
  return { service, client };
}

describe('UsersService', () => {
  describe('findOrCreateByPhone', () => {
    it('creates an enabled user on first sight', async () => {
      const { service, client } = build();

      const user = await service.findOrCreateByPhone(PHONE);

      expect(user).toEqual({ id: user.id, phone: PHONE, disabledAt: null });
      expect(client.users).toHaveLength(1);
    });

    it('returns the existing user unchanged', async () => {
      const { service, client } = build();
      const first = await service.findOrCreateByPhone(PHONE);

      const second = await service.findOrCreateByPhone(PHONE);

      expect(second).toEqual(first);
      expect(client.users).toHaveLength(1);
    });
  });

  it('finds a user by id and by phone, or null', async () => {
    const { service } = build();
    const user = await service.findOrCreateByPhone(PHONE);

    expect(await service.findById(user.id)).toEqual(user);
    expect(await service.findByPhone(PHONE)).toEqual(user);
    expect(
      await service.findById('00000000-0000-4000-8000-000000000000'),
    ).toBeNull();
    expect(await service.findByPhone('+966500000000')).toBeNull();
  });

  describe('findActiveAccess', () => {
    it('is null without a grant: a customer is not staff', async () => {
      const { service } = build();
      const user = await service.findOrCreateByPhone(PHONE);

      expect(await service.findActiveAccess(user.id, 'admin')).toBeNull();
    });

    it('returns the access of its own audience only', async () => {
      const { service } = build();
      const user = await service.grantAdminAccess(PHONE);

      expect(await service.findActiveAccess(user.id, 'admin')).toEqual({
        userId: user.id,
        audience: 'admin',
        organisationId: null,
      });
      expect(await service.findActiveAccess(user.id, 'vendor')).toBeNull();
    });

    it('is null once the access is deactivated', async () => {
      const { service, client } = build();
      const user = await service.grantAdminAccess(PHONE);
      const [access] = client.accesses;
      if (access === undefined) {
        throw new Error('expected an access row');
      }
      access.deactivatedAt = new Date();

      expect(await service.findActiveAccess(user.id, 'admin')).toBeNull();
    });
  });

  describe('grantAdminAccess', () => {
    it('creates the user when the phone is new', async () => {
      const { service, client } = build();

      const user = await service.grantAdminAccess(PHONE);

      expect(client.users).toEqual([
        { id: user.id, phone: PHONE, disabledAt: null },
      ]);
      expect(client.accesses).toHaveLength(1);
    });

    it('keeps an existing user and changes nothing when repeated', async () => {
      const { service, client } = build();
      const customer = await service.findOrCreateByPhone(PHONE);

      const first = await service.grantAdminAccess(PHONE);
      const second = await service.grantAdminAccess(PHONE);

      expect(first.id).toBe(customer.id);
      expect(second.id).toBe(customer.id);
      expect(client.users).toHaveLength(1);
      expect(client.accesses).toHaveLength(1);
    });

    it('reactivates a deactivated access', async () => {
      const { service, client } = build();
      const user = await service.grantAdminAccess(PHONE);
      const [access] = client.accesses;
      if (access === undefined) {
        throw new Error('expected an access row');
      }
      access.deactivatedAt = new Date();

      await service.grantAdminAccess(PHONE);

      expect(await service.findActiveAccess(user.id, 'admin')).not.toBeNull();
      expect(client.accesses).toHaveLength(1);
    });
  });

  describe('grantVendorAccess', () => {
    const VENDOR_A = '00000000-0000-4000-8000-00000000000a';
    const VENDOR_B = '00000000-0000-4000-8000-00000000000b';

    it('grants active vendor access for the vendor, and again changes nothing', async () => {
      const { service, client } = build();
      const user = await service.findOrCreateByPhone(PHONE);

      await service.grantVendorAccess(user.id, VENDOR_A);
      await service.grantVendorAccess(user.id, VENDOR_A);

      expect(client.accesses).toEqual([
        expect.objectContaining({
          userId: user.id,
          audience: 'vendor',
          organisationId: VENDOR_A,
          deactivatedAt: null,
        }),
      ]);
      await expect(
        service.findActiveAccess(user.id, 'vendor'),
      ).resolves.toEqual({
        userId: user.id,
        audience: 'vendor',
        organisationId: VENDOR_A,
      });
    });

    it('reactivates a deactivated access and points it at the new vendor', async () => {
      const { service, client } = build();
      const user = await service.findOrCreateByPhone(PHONE);
      await service.grantVendorAccess(user.id, VENDOR_A);
      const access = client.accesses[0];
      if (access !== undefined) {
        access.deactivatedAt = new Date('2026-11-15T09:00:00.000Z');
      }

      await service.grantVendorAccess(user.id, VENDOR_B);

      expect(client.accesses).toEqual([
        expect.objectContaining({
          organisationId: VENDOR_B,
          deactivatedAt: null,
        }),
      ]);
    });

    it('refuses with CONFLICT while the user works for another vendor, changing nothing', async () => {
      const { service, client } = build();
      const user = await service.findOrCreateByPhone(PHONE);
      await service.grantVendorAccess(user.id, VENDOR_A);

      await expect(
        service.grantVendorAccess(user.id, VENDOR_B),
      ).rejects.toMatchObject({
        code: ErrorCode.CONFLICT,
        details: { reason: 'USER_WORKS_FOR_ANOTHER_VENDOR' },
      });
      expect(client.accesses).toEqual([
        expect.objectContaining({
          organisationId: VENDOR_A,
          deactivatedAt: null,
        }),
      ]);
    });
  });
});
