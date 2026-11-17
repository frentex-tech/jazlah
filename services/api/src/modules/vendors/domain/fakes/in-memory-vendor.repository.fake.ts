import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { VendorRepository } from '../ports/vendor.repository.port';
import type { SealedIban } from '../sealed-iban.type';
import { Vendor } from '../vendor.entity';
import type { VendorApplication } from '../vendor-application.entity';
import type { VendorProfileChanges } from '../vendor-profile-changes.type';
import type { VendorListFilter } from '../vendor-list-filter.type';
import { matchesBusinessSearch } from './matches-business-search.fake';
import type { InMemoryVendorApplicationRepository } from './in-memory-vendor-application.repository.fake';
import { keysetPage } from '@common/pagination/keyset-page.fake';

/** One stored vendor: the entity and its sealed IBAN (null for the platform vendor). */
export type StoredVendor = Readonly<{
  vendor: Vendor;
  iban: SealedIban | null;
}>;

/**
 * VendorRepository in memory, with the same conditional updates. It copies the sealed
 * IBAN from the applications fake, as the Prisma repository copies it from the row.
 * `rows` is replaced on every write, so a test transaction can put it back.
 */
export class InMemoryVendorRepository implements VendorRepository {
  rows: readonly StoredVendor[] = [];
  private sequence = 0;
  private clock = Date.parse('2026-11-15T10:00:00.000Z');

  constructor(
    private readonly applications: InMemoryVendorApplicationRepository,
  ) {}

  createFromApplication(
    application: VendorApplication,
    commissionBasisPoints: number,
  ): Promise<Vendor> {
    const iban = this.applications.sealedIbanOf(application.id);
    if (iban === undefined) {
      return Promise.reject(new Error('no such application'));
    }
    const { details } = application;
    const vendor = new Vendor(
      this.nextId(),
      details.name,
      details.description,
      null,
      null,
      null,
      null,
      details.vatNumber,
      details.city,
      false,
      'active',
      null,
      null,
      commissionBasisPoints,
      details.commercialRegistrationNumber,
      iban.last4,
      details.accountHolderName,
      details.location,
      application.id,
      this.nextTime(),
    );
    this.rows = [...this.rows, { vendor, iban }];
    return Promise.resolve(vendor);
  }

  ensurePlatform(
    name: LocalizedText,
    commissionBasisPoints: number,
  ): Promise<Readonly<{ vendor: Vendor; created: boolean }>> {
    const existing = this.rows.find(({ vendor }) => vendor.isPlatform);
    if (existing !== undefined) {
      return Promise.resolve({ vendor: existing.vendor, created: false });
    }
    const vendor = new Vendor(
      this.nextId(),
      name,
      { ar: null, en: null },
      null,
      null,
      null,
      null,
      null,
      null,
      true,
      'active',
      null,
      null,
      commissionBasisPoints,
      null,
      null,
      null,
      null,
      null,
      this.nextTime(),
    );
    this.rows = [...this.rows, { vendor, iban: null }];
    return Promise.resolve({ vendor, created: true });
  }

  findById(id: string): Promise<Vendor | null> {
    return Promise.resolve(this.get(id) ?? null);
  }

  findActiveById(id: string): Promise<Vendor | null> {
    const vendor = this.get(id);
    return Promise.resolve(vendor?.status === 'active' ? vendor : null);
  }

  findPlatform(): Promise<Vendor | null> {
    return Promise.resolve(
      this.rows.find(({ vendor }) => vendor.isPlatform)?.vendor ?? null,
    );
  }

  findByIds(ids: readonly string[]): Promise<Vendor[]> {
    return Promise.resolve(
      this.rows
        .map(({ vendor }) => vendor)
        .filter((vendor) => ids.includes(vendor.id)),
    );
  }

  isSuspended(id: string): Promise<boolean> {
    const vendor = this.get(id);
    return Promise.resolve(
      vendor === undefined || vendor.status === 'suspended',
    );
  }

  list(filter: VendorListFilter, page: PageRequest): Promise<Page<Vendor>> {
    return Promise.resolve(
      keysetPage(
        this.rows
          .map((row) => row.vendor)
          .filter(
            (vendor) =>
              (filter.status === undefined ||
                vendor.status === filter.status) &&
              (filter.city === undefined || vendor.city === filter.city) &&
              (filter.q === undefined ||
                matchesBusinessSearch(
                  filter.q,
                  vendor.name,
                  vendor.commercialRegistrationNumber,
                )),
          ),
        page,
      ),
    );
  }

  suspend(id: string, reason: string): Promise<Vendor | null> {
    return this.update(id, (vendor) =>
      vendor.status !== 'active'
        ? null
        : this.copy(vendor, {
            status: 'suspended',
            suspendedAt: new Date('2026-11-15T12:00:00.000Z'),
            suspensionReason: reason,
          }),
    );
  }

  reinstate(id: string): Promise<Vendor | null> {
    return this.update(id, (vendor) =>
      vendor.status !== 'suspended'
        ? null
        : this.copy(vendor, {
            status: 'active',
            suspendedAt: null,
            suspensionReason: null,
          }),
    );
  }

  changeCommission(
    id: string,
    previous: number,
    next: number,
  ): Promise<Vendor | null> {
    return this.update(id, (vendor) =>
      vendor.commissionBasisPoints !== previous
        ? null
        : this.copy(vendor, { commissionBasisPoints: next }),
    );
  }

  updateProfile(
    vendorId: string,
    changes: VendorProfileChanges,
  ): Promise<Vendor | null> {
    return this.update(vendorId, (vendor) =>
      this.copy(vendor, {
        logoMediaId:
          changes.logoMediaId === undefined
            ? vendor.logoMediaId
            : changes.logoMediaId,
        coverMediaId:
          changes.coverMediaId === undefined
            ? vendor.coverMediaId
            : changes.coverMediaId,
        contactPhone:
          changes.contactPhone === undefined
            ? vendor.contactPhone
            : changes.contactPhone,
        contactEmail:
          changes.contactEmail === undefined
            ? vendor.contactEmail
            : changes.contactEmail,
        vatNumber:
          changes.vatNumber === undefined
            ? vendor.vatNumber
            : changes.vatNumber,
        city: changes.city ?? vendor.city,
        description: {
          ar:
            changes.descriptionAr === undefined
              ? vendor.description.ar
              : changes.descriptionAr,
          en:
            changes.descriptionEn === undefined
              ? vendor.description.en
              : changes.descriptionEn,
        },
      }),
    );
  }

  /** Stores a vendor as it is, for a test's starting state. */
  seed(vendor: Vendor): void {
    this.rows = [...this.rows, { vendor, iban: null }];
  }

  private get(id: string): Vendor | undefined {
    return this.rows.find(({ vendor }) => vendor.id === id)?.vendor;
  }

  private update(
    id: string,
    change: (vendor: Vendor) => Vendor | null,
  ): Promise<Vendor | null> {
    const current = this.get(id);
    const next = current === undefined ? null : change(current);
    if (next !== null) {
      this.rows = this.rows.map((row) =>
        row.vendor.id === id ? { ...row, vendor: next } : row,
      );
    }
    return Promise.resolve(next);
  }

  private copy(
    vendor: Vendor,
    changes: Partial<
      Pick<
        Vendor,
        | 'status'
        | 'suspendedAt'
        | 'suspensionReason'
        | 'commissionBasisPoints'
        | 'logoMediaId'
        | 'coverMediaId'
        | 'contactPhone'
        | 'contactEmail'
        | 'vatNumber'
        | 'city'
        | 'description'
      >
    >,
  ): Vendor {
    const merged = { ...vendor, ...changes };
    return new Vendor(
      merged.id,
      merged.name,
      merged.description,
      merged.logoMediaId,
      merged.coverMediaId,
      merged.contactPhone,
      merged.contactEmail,
      merged.vatNumber,
      merged.city,
      merged.isPlatform,
      merged.status,
      merged.suspendedAt,
      merged.suspensionReason,
      merged.commissionBasisPoints,
      merged.commercialRegistrationNumber,
      merged.ibanLast4,
      merged.accountHolderName,
      merged.location,
      merged.applicationId,
      merged.createdAt,
    );
  }

  private nextId(): string {
    this.sequence += 1;
    return `00000000-0000-4000-9000-${String(this.sequence).padStart(12, '0')}`;
  }

  private nextTime(): Date {
    this.clock += 1_000;
    return new Date(this.clock);
  }
}
