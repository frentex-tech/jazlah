import { randomUUID } from 'node:crypto';

type UserRow = {
  id: string;
  phone: string;
  disabledAt: Date | null;
};

type AccessRow = {
  id: string;
  userId: string;
  audience: string;
  organisationId: string | null;
  deactivatedAt: Date | null;
};

/**
 * The part of the database client UsersService uses (`client.user`,
 * `client.userAccess`), in memory, for its unit tests. It understands exactly the
 * queries the service sends. Excluded from the build (`*.fake.ts`).
 *
 * Use it as `{ client: fake } as unknown as DbContext`.
 */
export class InMemoryUsersClient {
  readonly users: UserRow[] = [];
  readonly accesses: AccessRow[] = [];

  readonly user = {
    createMany: (args: {
      data: { phone: string }[];
      skipDuplicates: boolean;
    }): Promise<{ count: number }> => {
      let count = 0;
      for (const { phone } of args.data) {
        if (!this.users.some((row) => row.phone === phone)) {
          this.users.push({ id: randomUUID(), phone, disabledAt: null });
          count += 1;
        }
      }
      return Promise.resolve({ count });
    },
    findUnique: (args: {
      where: { id?: string; phone?: string };
    }): Promise<UserRow | null> => {
      const { id, phone } = args.where;
      const row = this.users.find((user) =>
        id === undefined ? user.phone === phone : user.id === id,
      );
      return Promise.resolve(row === undefined ? null : { ...row });
    },
  };

  readonly userAccess = {
    createMany: (args: {
      data: { userId: string; audience: string; organisationId?: string }[];
      skipDuplicates: boolean;
    }): Promise<{ count: number }> => {
      let count = 0;
      for (const { userId, audience, organisationId } of args.data) {
        if (
          !this.accesses.some(
            (row) => row.userId === userId && row.audience === audience,
          )
        ) {
          this.accesses.push({
            id: randomUUID(),
            userId,
            audience,
            organisationId: organisationId ?? null,
            deactivatedAt: null,
          });
          count += 1;
        }
      }
      return Promise.resolve({ count });
    },
    /**
     * The two updates the service sends: reactivating a deactivated access (where
     * `deactivatedAt: { not: null }`), and grantVendorAccess's conditional update (where
     * `OR: [{ organisationId }, { deactivatedAt: { not: null } }]`).
     */
    updateMany: (args: {
      where: {
        userId: string;
        audience: string;
        deactivatedAt?: { not: null };
        OR?: [{ organisationId: string }, { deactivatedAt: { not: null } }];
      };
      data: { deactivatedAt: null; organisationId?: string };
    }): Promise<{ count: number }> => {
      const { where, data } = args;
      let count = 0;
      for (const row of this.accesses) {
        const matches =
          row.userId === where.userId &&
          row.audience === where.audience &&
          (where.OR === undefined
            ? row.deactivatedAt !== null
            : row.organisationId === where.OR[0].organisationId ||
              row.deactivatedAt !== null);
        if (matches) {
          row.deactivatedAt = data.deactivatedAt;
          if (data.organisationId !== undefined) {
            row.organisationId = data.organisationId;
          }
          count += 1;
        }
      }
      return Promise.resolve({ count });
    },
    findFirst: (args: {
      where: { userId: string; audience: string; deactivatedAt: null };
    }): Promise<AccessRow | null> => {
      const row = this.accesses.find(
        (access) =>
          access.userId === args.where.userId &&
          access.audience === args.where.audience &&
          access.deactivatedAt === null,
      );
      return Promise.resolve(row === undefined ? null : { ...row });
    },
  };
}
