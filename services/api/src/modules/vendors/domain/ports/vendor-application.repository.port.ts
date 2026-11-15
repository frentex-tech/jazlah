import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { NewVendorApplication } from '../new-vendor-application.type';
import type { VendorApplication } from '../vendor-application.entity';
import type { VendorApplicationStatus } from '../vendor-application-status.type';

/** Injection token of the VendorApplicationRepository. */
export const VENDOR_APPLICATION_REPOSITORY = Symbol(
  'VENDOR_APPLICATION_REPOSITORY',
);

/**
 * Where vendor applications are kept. Customer-side reads take the applicant's id, which
 * comes only from the access token: an application of someone else is not found.
 */
export interface VendorApplicationRepository {
  /**
   * Stores a pending application with its documents, in one statement. Throws
   * VENDOR_APPLICATION_ALREADY_PENDING when the applicant already has a pending one
   * (also when two arrive at once).
   */
  create(application: NewVendorApplication): Promise<VendorApplication>;

  /** The applicant's newest application, or null when they never applied. */
  findLatestOfApplicant(applicantId: string): Promise<VendorApplication | null>;

  findById(id: string): Promise<VendorApplication | null>;

  /** Newest first, optionally of one status. */
  list(
    filter: Readonly<{ status?: VendorApplicationStatus }>,
    page: PageRequest,
  ): Promise<Page<VendorApplication>>;

  /**
   * Approves a pending application (a conditional update from pending). Null when it is
   * no longer pending: another review won.
   */
  markApproved(
    id: string,
    reviewerId: string,
  ): Promise<VendorApplication | null>;

  /** Rejects a pending application with the reason; null when it is no longer pending. */
  markRejected(
    id: string,
    reviewerId: string,
    reason: string,
  ): Promise<VendorApplication | null>;
}
