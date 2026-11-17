import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { NewVendorApplication } from '../new-vendor-application.type';
import type { VendorApplicationRepository } from '../ports/vendor-application.repository.port';
import type { SealedIban } from '../sealed-iban.type';
import { VendorApplication } from '../vendor-application.entity';
import type { VendorApplicationListFilter } from '../vendor-application-list-filter.type';
import { keysetPage } from '@common/pagination/keyset-page.fake';
import { matchesBusinessSearch } from './matches-business-search.fake';

/** One stored application: the entity and its sealed IBAN, as the table keeps both. */
export type StoredVendorApplication = Readonly<{
  application: VendorApplication;
  iban: SealedIban;
}>;

/**
 * VendorApplicationRepository in memory. Like the partial unique index, it refuses a
 * second pending application of an applicant. `rows` is replaced on every write, so a
 * test transaction can put it back.
 */
export class InMemoryVendorApplicationRepository implements VendorApplicationRepository {
  rows: readonly StoredVendorApplication[] = [];
  private sequence = 0;
  private clock = Date.parse('2026-11-15T09:00:00.000Z');

  create(input: NewVendorApplication): Promise<VendorApplication> {
    if (
      this.rows.some(
        ({ application }) =>
          application.applicantId === input.applicantId &&
          application.status === 'pending',
      )
    ) {
      return Promise.reject(
        new AppError(ErrorCode.VENDOR_APPLICATION_ALREADY_PENDING),
      );
    }
    this.sequence += 1;
    this.clock += 1_000;
    const application = new VendorApplication(
      `00000000-0000-4000-8000-${String(this.sequence).padStart(12, '0')}`,
      input.applicantId,
      input.details,
      input.iban.last4,
      'pending',
      null,
      null,
      null,
      input.documents,
      new Date(this.clock),
    );
    this.rows = [...this.rows, { application, iban: input.iban }];
    return Promise.resolve(application);
  }

  findLatestOfApplicant(
    applicantId: string,
  ): Promise<VendorApplication | null> {
    const page = keysetPage(
      this.rows
        .map((row) => row.application)
        .filter((application) => application.applicantId === applicantId),
      { cursor: null, limit: 1 },
    );
    return Promise.resolve(page.items[0] ?? null);
  }

  findById(id: string): Promise<VendorApplication | null> {
    return Promise.resolve(
      this.rows.find(({ application }) => application.id === id)?.application ??
        null,
    );
  }

  list(
    filter: VendorApplicationListFilter,
    page: PageRequest,
  ): Promise<Page<VendorApplication>> {
    return Promise.resolve(
      keysetPage(
        this.rows
          .map((row) => row.application)
          .filter(
            (application) =>
              (filter.status === undefined ||
                application.status === filter.status) &&
              (filter.q === undefined ||
                matchesBusinessSearch(
                  filter.q,
                  application.details.name,
                  application.details.commercialRegistrationNumber,
                )),
          ),
        page,
      ),
    );
  }

  markApproved(
    id: string,
    reviewerId: string,
  ): Promise<VendorApplication | null> {
    return this.review(id, 'approved', reviewerId, null);
  }

  markRejected(
    id: string,
    reviewerId: string,
    reason: string,
  ): Promise<VendorApplication | null> {
    return this.review(id, 'rejected', reviewerId, reason);
  }

  deleteUnapprovedOf(applicantId: string): Promise<number> {
    const before = this.rows.length;
    this.rows = this.rows.filter(
      ({ application }) =>
        application.applicantId !== applicantId ||
        application.status === 'approved',
    );
    return Promise.resolve(before - this.rows.length);
  }

  approvedDocumentMediaIdsOf(applicantId: string): Promise<string[]> {
    return Promise.resolve(
      this.rows
        .map(({ application }) => application)
        .filter(
          (application) =>
            application.applicantId === applicantId &&
            application.status === 'approved',
        )
        .flatMap((application) =>
          application.documents.map((document) => document.mediaId),
        ),
    );
  }

  /** The sealed IBAN of an application, as PrismaVendorRepository copies it. */
  sealedIbanOf(id: string): SealedIban | undefined {
    return this.rows.find(({ application }) => application.id === id)?.iban;
  }

  private review(
    id: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    reason: string | null,
  ): Promise<VendorApplication | null> {
    const stored = this.rows.find(({ application }) => application.id === id);
    if (stored === undefined || stored.application.status !== 'pending') {
      return Promise.resolve(null);
    }
    const old = stored.application;
    const reviewed = new VendorApplication(
      old.id,
      old.applicantId,
      old.details,
      old.ibanLast4,
      status,
      reason,
      reviewerId,
      new Date('2026-11-15T12:00:00.000Z'),
      old.documents,
      old.createdAt,
    );
    this.rows = this.rows.map((row) =>
      row === stored ? { ...row, application: reviewed } : row,
    );
    return Promise.resolve(reviewed);
  }
}
