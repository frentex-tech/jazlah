import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { DbContext } from '@infra/database/db-context';
import type { CustomerAddress as CustomerAddressRow } from '@infra/database/generated/prisma/client';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { CoverageService } from '@modules/coverage';
import { ORDER_ADDRESS_USAGE, type OrderAddressUsage } from '@modules/orders';
import { UsersService } from '@modules/users';
import type { CustomerAccounts } from './customer-accounts.type';
import type { CustomerAddress } from './customer-address.type';
import type { CustomerAddressChanges } from './customer-address-changes.type';
import { CUSTOMER_LIMITS } from './customer-limits.constants';
import { findCustomer } from './find-customer';
import { lockCustomer } from './lock-customer';
import type { NewCustomerAddress } from './new-customer-address.type';

/** Newest first, the id breaking a tie in the creation time. */
const NEWEST_FIRST = [{ createdAt: 'desc' }, { id: 'desc' }] as const;

/**
 * Customers' saved addresses (table `customer_addresses`, FR-ACC-03): at most
 * CUSTOMER_LIMITS.addresses each, and exactly one default once any exist. The first
 * address becomes the default, making another the default clears the old one, and
 * deleting the default promotes the newest remaining one.
 *
 * Every write locks the user's row first (lockCustomer), then counts or reads and
 * decides: two writes of one customer happen one after the other, so the limit and the
 * single default hold under concurrent requests (`modules.md`, "A write to an aggregate
 * locks its root row first"). The partial unique index
 * `customer_addresses_user_id_default_key` guarantees at most one default even if this
 * code were wrong; "at least one" is this code's alone.
 *
 * Another customer's address is NOT_FOUND, exactly like a missing one. Every address
 * returned says whether an active coverage zone covers it (`isCovered`) and whether a
 * non-final order uses it (`isLocked`). Orders keep both the immutable checkout snapshot
 * and a nullable reference to the saved address; only the reference is used for locking.
 */
@Injectable()
export class CustomerAddressesService {
  constructor(
    private readonly db: DbContext,
    @Inject(UsersService) private readonly accounts: CustomerAccounts,
    // Narrowed to what is used, so a unit test passes a plain object.
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
    @Inject(CoverageService)
    private readonly coverage: Pick<CoverageService, 'isCovered'>,
    @Inject(ORDER_ADDRESS_USAGE)
    private readonly orderAddressUsage: OrderAddressUsage,
  ) {}

  /** The customer's addresses, the default first, then newest first; at most ten. */
  async list(userId: string): Promise<CustomerAddress[]> {
    await findCustomer(this.accounts, userId);
    const rows = await this.query(() =>
      this.db.client.customerAddress.findMany({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, ...NEWEST_FIRST],
      }),
    );
    return Promise.all(rows.map((row) => this.toAddress(row)));
  }

  /** One of the customer's addresses, or NOT_FOUND. */
  async get(userId: string, id: string): Promise<CustomerAddress> {
    await findCustomer(this.accounts, userId);
    return this.toAddress(await this.ownRow(userId, id));
  }

  /**
   * Adds an address. ADDRESS_LIMIT_REACHED when the customer already has the most
   * allowed, and nothing is added. The first address is the default; `makeDefault`
   * makes a later one the default instead of the current one.
   */
  async create(
    userId: string,
    address: NewCustomerAddress,
  ): Promise<CustomerAddress> {
    const row = await this.transactions.run(async () => {
      await lockCustomer(this.accounts, userId);
      const count = await this.query(() =>
        this.db.client.customerAddress.count({ where: { userId } }),
      );
      if (count >= CUSTOMER_LIMITS.addresses) {
        throw new AppError(ErrorCode.ADDRESS_LIMIT_REACHED, {
          details: { limit: CUSTOMER_LIMITS.addresses },
        });
      }
      const isDefault = count === 0 || address.makeDefault;
      if (isDefault) {
        await this.clearDefault(userId);
      }
      return this.query(() =>
        this.db.client.customerAddress.create({
          data: {
            userId,
            label: address.label,
            latitude: address.location.latitude,
            longitude: address.location.longitude,
            city: address.city,
            district: address.district,
            street: address.street,
            building: address.building,
            shortNationalAddress: address.shortNationalAddress,
            driverInstructions: address.driverInstructions,
            isDefault,
          },
        }),
      );
    });
    return this.toAddress(row);
  }

  /** Changes an address; the default stays as it is. NOT_FOUND for another's. */
  async update(
    userId: string,
    id: string,
    changes: CustomerAddressChanges,
  ): Promise<CustomerAddress> {
    const row = await this.transactions.run(async () => {
      await lockCustomer(this.accounts, userId);
      await this.ownRow(userId, id);
      await this.assertNotLocked(userId, id);
      const { location, ...fields } = changes;
      return this.query(() =>
        this.db.client.customerAddress.update({
          where: { id },
          data: { ...fields, ...location },
        }),
      );
    });
    return this.toAddress(row);
  }

  /** Makes an address the default, clearing the old one. NOT_FOUND for another's. */
  async makeDefault(userId: string, id: string): Promise<CustomerAddress> {
    const row = await this.transactions.run(async () => {
      await lockCustomer(this.accounts, userId);
      const own = await this.ownRow(userId, id);
      if (own.isDefault) {
        return own;
      }
      await this.clearDefault(userId);
      return this.query(() =>
        this.db.client.customerAddress.update({
          where: { id },
          data: { isDefault: true },
        }),
      );
    });
    return this.toAddress(row);
  }

  /**
   * Deletes an address; when it was the default, the newest remaining one becomes the
   * default. NOT_FOUND for another's.
   */
  remove(userId: string, id: string): Promise<void> {
    return this.transactions.run(async () => {
      await lockCustomer(this.accounts, userId);
      const row = await this.ownRow(userId, id);
      await this.assertNotLocked(userId, id);
      await this.query(() =>
        this.db.client.customerAddress.delete({ where: { id } }),
      );
      if (!row.isDefault) {
        return;
      }
      const newest = await this.query(() =>
        this.db.client.customerAddress.findFirst({
          where: { userId },
          orderBy: [...NEWEST_FIRST],
        }),
      );
      if (newest !== null) {
        await this.query(() =>
          this.db.client.customerAddress.update({
            where: { id: newest.id },
            data: { isDefault: true },
          }),
        );
      }
    });
  }

  /**
   * Deletes every address of the customer (an account deletion). Database only, inside
   * the caller's transaction, after the user's row is locked.
   */
  async eraseOf(userId: string): Promise<void> {
    await this.query(() =>
      this.db.client.customerAddress.deleteMany({ where: { userId } }),
    );
  }

  private async ownRow(
    userId: string,
    id: string,
  ): Promise<CustomerAddressRow> {
    const row = await this.query(() =>
      this.db.client.customerAddress.findFirst({ where: { id, userId } }),
    );
    if (row === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return row;
  }

  /** Address edits and deletion wait until every referring order is final. */
  private async assertNotLocked(userId: string, id: string): Promise<void> {
    if (await this.orderAddressUsage.isLocked(userId, id)) {
      throw new AppError(ErrorCode.ADDRESS_IN_USE);
    }
  }

  /** Before a new default is set: the partial unique index allows one at a time. */
  private async clearDefault(userId: string): Promise<void> {
    await this.query(() =>
      this.db.client.customerAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
    );
  }

  private async toAddress(row: CustomerAddressRow): Promise<CustomerAddress> {
    const location = { latitude: row.latitude, longitude: row.longitude };
    const [isCovered, isLocked] = await Promise.all([
      this.coverage.isCovered(location),
      this.orderAddressUsage.isLocked(row.userId, row.id),
    ]);
    return {
      id: row.id,
      label: row.label,
      location,
      city: row.city,
      district: row.district,
      street: row.street,
      building: row.building,
      shortNationalAddress: row.shortNationalAddress,
      driverInstructions: row.driverInstructions,
      isDefault: row.isDefault,
      isCovered,
      isLocked,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private async query<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      mapPrismaError(error);
    }
  }
}
