import { randomUUID } from 'node:crypto';

type ProfileRow = {
  id: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  preferredLanguage: 'ar' | 'en';
  createdAt: Date;
  updatedAt: Date;
};

type AddressRow = {
  id: string;
  userId: string;
  label: string;
  latitude: number;
  longitude: number;
  city: string | null;
  district: string | null;
  street: string | null;
  building: string | null;
  shortNationalAddress: string | null;
  driverInstructions: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ConsentRow = {
  id: string;
  userId: string;
  kind: 'marketing';
  granted: boolean;
  sequence: number;
  source: 'customer' | 'account_deletion';
  createdAt: Date;
};

type Changes = Readonly<Record<string, unknown>>;

/** The fields of `changes` that are set: Prisma ignores `undefined`. */
function defined(changes: Changes): Changes {
  return Object.fromEntries(
    Object.entries(changes).filter(([, value]) => value !== undefined),
  );
}

/**
 * The part of the database client the customers services use (`customerProfile`,
 * `customerAddress`, `consentRecord`), in memory, for their unit tests. It understands
 * exactly the queries the services send, and keeps the two guarantees of the database
 * they rely on: at most one default address per customer (the partial unique index) and
 * one consent sequence number per customer and kind (the unique index). Each row's
 * `createdAt` is a millisecond after the previous one, so "newest" is deterministic.
 * Excluded from the build (`*.fake.ts`).
 *
 * Use it as `{ client: fake } as unknown as DbContext`.
 */
export class InMemoryCustomersClient {
  readonly profiles: ProfileRow[] = [];
  addresses: AddressRow[] = [];
  readonly consents: ConsentRow[] = [];
  private clock = Date.parse('2026-11-17T09:00:00.000Z');

  readonly customerProfile = {
    findUnique: (args: {
      where: { userId: string };
    }): Promise<ProfileRow | null> =>
      Promise.resolve(this.copy(this.profileOf(args.where.userId))),
    upsert: (args: {
      where: { userId: string };
      create: Changes & { userId: string };
      update: Changes;
    }): Promise<ProfileRow> => {
      const existing = this.profileOf(args.where.userId);
      if (existing !== undefined) {
        Object.assign(existing, defined(args.update), {
          updatedAt: this.now(),
        });
        return Promise.resolve({ ...existing });
      }
      const now = this.now();
      const row: ProfileRow = {
        id: randomUUID(),
        fullName: null,
        email: null,
        preferredLanguage: 'ar',
        createdAt: now,
        updatedAt: now,
        ...(defined(args.create) as { userId: string }),
      };
      this.profiles.push(row);
      return Promise.resolve({ ...row });
    },
    deleteMany: (args: {
      where: { userId: string };
    }): Promise<{ count: number }> => {
      const index = this.profiles.findIndex(
        (row) => row.userId === args.where.userId,
      );
      if (index === -1) {
        return Promise.resolve({ count: 0 });
      }
      this.profiles.splice(index, 1);
      return Promise.resolve({ count: 1 });
    },
  };

  readonly customerAddress = {
    count: (args: { where: { userId: string } }): Promise<number> =>
      Promise.resolve(this.addressesOf(args.where.userId).length),
    /** The list: default first, then newest first. */
    findMany: (args: { where: { userId: string } }): Promise<AddressRow[]> =>
      Promise.resolve(
        this.newestFirst(this.addressesOf(args.where.userId))
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
          .map((row) => ({ ...row })),
      ),
    /** One own address (`where: { id, userId }`), or the newest (`where: { userId }`). */
    findFirst: (args: {
      where: { id?: string; userId: string };
    }): Promise<AddressRow | null> => {
      const { id, userId } = args.where;
      const rows = this.newestFirst(this.addressesOf(userId)).filter(
        (row) => id === undefined || row.id === id,
      );
      return Promise.resolve(this.copy(rows[0]));
    },
    create: (args: {
      data: Omit<AddressRow, 'id' | 'createdAt' | 'updatedAt'>;
    }): Promise<AddressRow> => {
      const now = this.now();
      const row: AddressRow = {
        id: randomUUID(),
        ...args.data,
        createdAt: now,
        updatedAt: now,
      };
      this.assertOneDefault([...this.addresses, row]);
      this.addresses.push(row);
      return Promise.resolve({ ...row });
    },
    update: (args: {
      where: { id: string };
      data: Changes;
    }): Promise<AddressRow> => {
      const row = this.addresses.find((each) => each.id === args.where.id);
      if (row === undefined) {
        return Promise.reject(new Error(`No address ${args.where.id}`));
      }
      const next = { ...row, ...defined(args.data), updatedAt: this.now() };
      this.assertOneDefault(
        this.addresses.map((each) => (each === row ? next : each)),
      );
      Object.assign(row, next);
      return Promise.resolve({ ...row });
    },
    /** clearDefault: `where: { userId, isDefault: true }`. */
    updateMany: (args: {
      where: { userId: string; isDefault: true };
      data: { isDefault: false };
    }): Promise<{ count: number }> => {
      const rows = this.addressesOf(args.where.userId).filter(
        (row) => row.isDefault,
      );
      for (const row of rows) {
        row.isDefault = false;
      }
      return Promise.resolve({ count: rows.length });
    },
    delete: (args: { where: { id: string } }): Promise<AddressRow> => {
      const row = this.addresses.find((each) => each.id === args.where.id);
      if (row === undefined) {
        return Promise.reject(new Error(`No address ${args.where.id}`));
      }
      this.addresses = this.addresses.filter((each) => each !== row);
      return Promise.resolve({ ...row });
    },
    deleteMany: (args: {
      where: { userId: string };
    }): Promise<{ count: number }> => {
      const before = this.addresses.length;
      this.addresses = this.addresses.filter(
        (row) => row.userId !== args.where.userId,
      );
      return Promise.resolve({ count: before - this.addresses.length });
    },
  };

  readonly consentRecord = {
    /** The latest: `where: { userId, kind }`, `orderBy: { sequence: 'desc' }`. */
    findFirst: (args: {
      where: { userId: string; kind: 'marketing' };
    }): Promise<ConsentRow | null> => {
      const latest = this.consents
        .filter(
          (row) =>
            row.userId === args.where.userId && row.kind === args.where.kind,
        )
        .sort((a, b) => b.sequence - a.sequence)[0];
      return Promise.resolve(this.copy(latest));
    },
    create: (args: {
      data: Omit<ConsentRow, 'id' | 'createdAt'>;
    }): Promise<ConsentRow> => {
      const { userId, kind, sequence } = args.data;
      if (
        this.consents.some(
          (row) =>
            row.userId === userId &&
            row.kind === kind &&
            row.sequence === sequence,
        )
      ) {
        return Promise.reject(
          new Error('consent_records_user_id_kind_sequence_key'),
        );
      }
      const row: ConsentRow = {
        id: randomUUID(),
        ...args.data,
        createdAt: this.now(),
      };
      this.consents.push(row);
      return Promise.resolve({ ...row });
    },
  };

  private profileOf(userId: string): ProfileRow | undefined {
    return this.profiles.find((row) => row.userId === userId);
  }

  private addressesOf(userId: string): AddressRow[] {
    return this.addresses.filter((row) => row.userId === userId);
  }

  private newestFirst(rows: AddressRow[]): AddressRow[] {
    return [...rows].sort(
      (a, b) =>
        b.createdAt.getTime() - a.createdAt.getTime() ||
        b.id.localeCompare(a.id),
    );
  }

  /** As the partial unique index customer_addresses_user_id_default_key. */
  private assertOneDefault(rows: readonly AddressRow[]): void {
    const owners = rows.filter((row) => row.isDefault).map((row) => row.userId);
    if (new Set(owners).size !== owners.length) {
      throw new Error('customer_addresses_user_id_default_key');
    }
  }

  private now(): Date {
    this.clock += 1;
    return new Date(this.clock);
  }

  private copy<T extends object>(row: T | undefined): T | null {
    return row === undefined ? null : { ...row };
  }
}
