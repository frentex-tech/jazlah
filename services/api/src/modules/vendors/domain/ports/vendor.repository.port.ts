import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { Vendor } from '../vendor.entity';
import type { VendorApplication } from '../vendor-application.entity';
import type { VendorProfileChanges } from '../vendor-profile-changes.type';
import type { VendorListFilter } from '../vendor-list-filter.type';

/** Injection token of the VendorRepository. */
export const VENDOR_REPOSITORY = Symbol('VENDOR_REPOSITORY');

/**
 * Where vendors are kept. A vendor-side caller passes the vendor id from the access
 * token's organisation, never one from the request, so a vendor reaches only its own
 * record; any other id is simply not found.
 */
export interface VendorRepository {
  /**
   * Creates the vendor of an approved application: its details and its encrypted IBAN,
   * copied from the application's row (the ciphertext never leaves the database layer),
   * and its first commission.
   */
  createFromApplication(
    application: VendorApplication,
    commissionBasisPoints: number,
  ): Promise<Vendor>;

  /**
   * Creates the platform vendor unless it exists (at most one can). Returns it, and
   * whether this call created it; safe beside a concurrent call.
   */
  ensurePlatform(
    name: LocalizedText,
    commissionBasisPoints: number,
  ): Promise<Readonly<{ vendor: Vendor; created: boolean }>>;

  findById(id: string): Promise<Vendor | null>;

  /** The vendor if it is active; null otherwise (public reads). */
  findActiveById(id: string): Promise<Vendor | null>;

  /** The platform vendor, or null before `pnpm vendor:create-platform` has run. */
  findPlatform(): Promise<Vendor | null>;

  /** The vendors with these ids, whatever their status; unknown ids are left out. */
  findByIds(ids: readonly string[]): Promise<Vendor[]>;

  /** Whether the vendor is suspended; true when no vendor has this id. */
  isSuspended(id: string): Promise<boolean>;

  /** Newest first, narrowed by the filter (status, search; see its type). */
  list(filter: VendorListFilter, page: PageRequest): Promise<Page<Vendor>>;

  /**
   * Suspends an active vendor now (conditional update); null when it was not active.
   */
  suspend(id: string, reason: string): Promise<Vendor | null>;

  /** Reinstates a suspended vendor (conditional update); null when it was not suspended. */
  reinstate(id: string): Promise<Vendor | null>;

  /**
   * Sets the commission if it is still `previous` (a conditional update); null when it
   * changed meanwhile.
   */
  changeCommission(
    id: string,
    previous: number,
    next: number,
  ): Promise<Vendor | null>;

  /** Applies the vendor's own profile changes; null when no vendor has this id. */
  updateProfile(
    vendorId: string,
    changes: VendorProfileChanges,
  ): Promise<Vendor | null>;
}
