import { randomUUID } from 'node:crypto';

type UserRow = {
  id: string;
  phone: string | null;
  disabledAt: Date | null;
  deletedAt: Date | null;
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
 * `client.userAccess`, `$queryRaw` for the row locks), in memory, for its unit tests.
 * It understands exactly the queries the service sends. Excluded from the build
 * (`*.fake.ts`).
 *
 * Use it as `{ client: fake } as unknown as DbContext`.
 */
export class InMemoryUsersClient {
  readonly users: UserRow[] = [];
  readonly accesses: AccessRow[] = [];
  /** Each row lock taken, in order: `<FOR UPDATE|FOR SHARE> <id>`. */
  readonly locks: string[] = [];

  /**
   * The two row locks (`SELECT … WHERE id = $1 AND deleted_at IS NULL FOR UPDATE` or
   * `FOR SHARE`): the live user with that id, or nothing.
   */
  readonly $queryRaw = (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<Omit<UserRow, 'deletedAt'>[]> => {
    const sql = strings.join('?');
    const id = values[0];
    if (!/"deleted_at" IS NULL\s+FOR (UPDATE|SHARE)/.test(sql)) {
      throw new Error(`Unexpected query: ${sql}`);
    }
    this.locks.push(
      `${sql.includes('FOR UPDATE') ? 'FOR UPDATE' : 'FOR SHARE'} ${String(id)}`,
    );
    const row = this.users.find(
      (user) => user.id === id && user.deletedAt === null,
    );
    return Promise.resolve(
      row === undefined
        ? []
        : [{ id: row.id, phone: row.phone, disabledAt: row.disabledAt }],
    );
  };

  readonly user = {
    createMany: (args: {
      data: { phone: string }[];
      skipDuplicates: boolean;
    }): Promise<{ count: number }> => {
      let count = 0;
      for (const { phone } of args.data) {
        if (!this.users.some((row) => row.phone === phone)) {
          this.users.push({
            id: randomUUID(),
            phone,
            disabledAt: null,
            deletedAt: null,
          });
          count += 1;
        }
      }
      return Promise.resolve({ count });
    },
    findUnique: (args: {
      where: { phone: string };
    }): Promise<UserRow | null> => {
      const row = this.users.find((user) => user.phone === args.where.phone);
      return Promise.resolve(row === undefined ? null : { ...row });
    },
    findFirst: (args: {
      where: { id: string; deletedAt: null };
    }): Promise<UserRow | null> => {
      const row = this.users.find(
        (user) => user.id === args.where.id && user.deletedAt === null,
      );
      return Promise.resolve(row === undefined ? null : { ...row });
    },
    /** markDeleted's conditional update: `where: { id, deletedAt: null }`. */
    updateMany: (args: {
      where: { id: string; deletedAt: null };
      data: { phone: null; deletedAt: Date };
    }): Promise<{ count: number }> => {
      const row = this.users.find(
        (user) => user.id === args.where.id && user.deletedAt === null,
      );
      if (row === undefined) {
        return Promise.resolve({ count: 0 });
      }
      row.phone = args.data.phone;
      row.deletedAt = args.data.deletedAt;
      return Promise.resolve({ count: 1 });
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
    /** hasActiveStaffAccess: `where: { userId, deactivatedAt: null }`. */
    count: (args: {
      where: { userId: string; deactivatedAt: null };
    }): Promise<number> =>
      Promise.resolve(
        this.accesses.filter(
          (access) =>
            access.userId === args.where.userId &&
            access.deactivatedAt === null,
        ).length,
      ),
  };
}
