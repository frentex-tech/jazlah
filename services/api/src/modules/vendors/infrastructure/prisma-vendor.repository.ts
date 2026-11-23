import { Injectable } from '@nestjs/common';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { toPage } from '@common/pagination/to-page';
import { DbContext } from '@infra/database/db-context';
import { keysetAfter } from '@infra/database/keyset-after';
import { KEYSET_ORDER } from '@infra/database/keyset-order.constants';
import { mapConstraintViolation } from '@infra/database/map-constraint-violation';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { VendorRepository } from '../domain/ports/vendor.repository.port';
import type { Vendor } from '../domain/vendor.entity';
import type { VendorApplication } from '../domain/vendor-application.entity';
import type { VendorProfileChanges } from '../domain/vendor-profile-changes.type';
import type { VendorListFilter } from '../domain/vendor-list-filter.type';
import type { VendorStatus } from '../domain/vendor-status.type';
import { businessSearchCondition } from './business-search-condition';
import { toVendor } from './vendor.mapper';

/**
 * The vendors in `vendors`. Status and commission changes are conditional updates on
 * the current value, so concurrent admins cannot both win. A vendor-side caller passes
 * the token's organisation as the id: any other vendor is simply not found.
 */
@Injectable()
export class PrismaVendorRepository implements VendorRepository {
  constructor(private readonly db: DbContext) {}

  async createFromApplication(
    application: VendorApplication,
    commissionBasisPoints: number,
  ): Promise<Vendor> {
    const { details } = application;
    try {
      // The encrypted IBAN is copied from the application's row, so the ciphertext never
      // leaves this layer.
      const sealed = await this.db.client.vendorApplication.findUnique({
        where: { id: application.id },
        select: { ibanEncrypted: true, ibanKeyId: true, ibanLast4: true },
      });
      if (sealed === null) {
        throw new Error(`Vendor application ${application.id} disappeared`);
      }
      return toVendor(
        await this.db.client.vendor.create({
          data: {
            nameAr: details.name.ar,
            nameEn: details.name.en,
            descriptionAr: details.description.ar,
            descriptionEn: details.description.en,
            commissionBasisPoints,
            commercialRegistrationNumber: details.commercialRegistrationNumber,
            vatNumber: details.vatNumber,
            city: details.city,
            ibanEncrypted: sealed.ibanEncrypted,
            ibanKeyId: sealed.ibanKeyId,
            ibanLast4: sealed.ibanLast4,
            accountHolderName: details.accountHolderName,
            latitude: details.location.latitude,
            longitude: details.location.longitude,
            applicationId: application.id,
          },
        }),
      );
    } catch (error) {
      mapConstraintViolation(error, {
        vendors_commercial_registration_number_key: ErrorCode.VENDOR_CR_EXISTS,
      });
    }
  }

  async ensurePlatform(
    name: LocalizedText,
    commissionBasisPoints: number,
  ): Promise<Readonly<{ vendor: Vendor; created: boolean }>> {
    try {
      // ON CONFLICT DO NOTHING against the partial unique index vendors_is_platform_key:
      // a concurrent creation is ignored instead of failing (and ending the transaction).
      const { count } = await this.db.client.vendor.createMany({
        data: [
          {
            nameAr: name.ar,
            nameEn: name.en,
            isPlatform: true,
            commissionBasisPoints,
          },
        ],
        skipDuplicates: true,
      });
      const row = await this.db.client.vendor.findFirst({
        where: { isPlatform: true },
      });
      if (row === null) {
        throw new Error(
          'The platform vendor disappeared right after it was created',
        );
      }
      return { vendor: toVendor(row), created: count === 1 };
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findById(id: string): Promise<Vendor | null> {
    return this.findOne({ id });
  }

  async findActiveById(id: string): Promise<Vendor | null> {
    return this.findOne({ id, status: 'active' });
  }

  async existsWithRegistration(
    commercialRegistrationNumber: string,
  ): Promise<boolean> {
    try {
      const row = await this.db.client.vendor.findUnique({
        where: { commercialRegistrationNumber },
        select: { id: true },
      });
      return row !== null;
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findPlatform(): Promise<Vendor | null> {
    try {
      const row = await this.db.client.vendor.findFirst({
        where: { isPlatform: true },
      });
      return row === null ? null : toVendor(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findByIds(ids: readonly string[]): Promise<Vendor[]> {
    if (ids.length === 0) {
      return [];
    }
    try {
      const rows = await this.db.client.vendor.findMany({
        where: { id: { in: [...ids] } },
      });
      return rows.map(toVendor);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async isSuspended(id: string): Promise<boolean> {
    try {
      const row = await this.db.client.vendor.findUnique({
        where: { id },
        select: { status: true },
      });
      return row === null || row.status === 'suspended';
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async list(
    filter: VendorListFilter,
    page: PageRequest,
  ): Promise<Page<Vendor>> {
    try {
      const rows = await this.db.client.vendor.findMany({
        where: {
          ...(filter.status === undefined ? {} : { status: filter.status }),
          ...(filter.city === undefined ? {} : { city: filter.city }),
          ...(filter.q === undefined ? {} : businessSearchCondition(filter.q)),
          ...keysetAfter(page.cursor),
        },
        orderBy: [...KEYSET_ORDER],
        take: page.limit + 1,
      });
      return toPage(rows.map(toVendor), page.limit);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async suspend(id: string, reason: string): Promise<Vendor | null> {
    return this.updateWhere(
      { id, status: 'active' },
      {
        status: 'suspended',
        suspendedAt: new Date(),
        suspensionReason: reason,
      },
    );
  }

  async reinstate(id: string): Promise<Vendor | null> {
    return this.updateWhere(
      { id, status: 'suspended' },
      { status: 'active', suspendedAt: null, suspensionReason: null },
    );
  }

  async changeCommission(
    id: string,
    previous: number,
    next: number,
  ): Promise<Vendor | null> {
    return this.updateWhere(
      { id, commissionBasisPoints: previous },
      { commissionBasisPoints: next },
    );
  }

  async updateProfile(
    vendorId: string,
    changes: VendorProfileChanges,
  ): Promise<Vendor | null> {
    return this.updateWhere({ id: vendorId }, changes);
  }

  private async findOne(where: {
    id: string;
    status?: VendorStatus;
  }): Promise<Vendor | null> {
    try {
      const row = await this.db.client.vendor.findFirst({ where });
      return row === null ? null : toVendor(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /** A conditional update; the vendor as it is after it, or null when it matched nothing. */
  private async updateWhere(
    where: {
      id: string;
      status?: VendorStatus;
      commissionBasisPoints?: number;
    },
    data: VendorProfileChanges & {
      status?: VendorStatus;
      suspendedAt?: Date | null;
      suspensionReason?: string | null;
      commissionBasisPoints?: number;
    },
  ): Promise<Vendor | null> {
    try {
      const { count } = await this.db.client.vendor.updateMany({ where, data });
      return count === 1 ? this.findById(where.id) : null;
    } catch (error) {
      mapPrismaError(error);
    }
  }
}
