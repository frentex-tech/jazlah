import { Injectable } from '@nestjs/common';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { toPage } from '@common/pagination/to-page';
import { DbContext } from '@infra/database/db-context';
import { keysetAfter } from '@infra/database/keyset-after';
import { KEYSET_ORDER } from '@infra/database/keyset-order.constants';
import { mapConstraintViolation } from '@infra/database/map-constraint-violation';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { NewVendorApplication } from '../domain/new-vendor-application.type';
import type { VendorApplicationRepository } from '../domain/ports/vendor-application.repository.port';
import type { VendorApplication } from '../domain/vendor-application.entity';
import type { VendorApplicationStatus } from '../domain/vendor-application-status.type';
import { toVendorApplication } from './vendor-application.mapper';

/** Every read brings the documents along. */
const WITH_DOCUMENTS = { documents: true } as const;

/**
 * The applications in `vendor_applications` and their documents. One pending
 * application per applicant is the partial unique index
 * `vendor_applications_applicant_id_pending_key`; reviews are conditional updates from
 * pending.
 */
@Injectable()
export class PrismaVendorApplicationRepository implements VendorApplicationRepository {
  constructor(private readonly db: DbContext) {}

  async create(application: NewVendorApplication): Promise<VendorApplication> {
    const { details, iban } = application;
    try {
      // One statement with its nested documents: atomic without a transaction, so the
      // unique index's violation can be translated here (inside a transaction it would
      // have ended it).
      return toVendorApplication(
        await this.db.client.vendorApplication.create({
          data: {
            applicantId: application.applicantId,
            nameAr: details.name.ar,
            nameEn: details.name.en,
            descriptionAr: details.description.ar,
            descriptionEn: details.description.en,
            commercialRegistrationNumber: details.commercialRegistrationNumber,
            ibanEncrypted: iban.ciphertext,
            ibanKeyId: iban.keyId,
            ibanLast4: iban.last4,
            accountHolderName: details.accountHolderName,
            latitude: details.location.latitude,
            longitude: details.location.longitude,
            documents: {
              create: application.documents.map((document) => ({
                kind: document.kind,
                mediaId: document.mediaId,
              })),
            },
          },
          include: WITH_DOCUMENTS,
        }),
      );
    } catch (error) {
      mapConstraintViolation(error, {
        vendor_applications_applicant_id_pending_key:
          ErrorCode.VENDOR_APPLICATION_ALREADY_PENDING,
      });
    }
  }

  async findLatestOfApplicant(
    applicantId: string,
  ): Promise<VendorApplication | null> {
    try {
      const row = await this.db.client.vendorApplication.findFirst({
        where: { applicantId },
        orderBy: [...KEYSET_ORDER],
        include: WITH_DOCUMENTS,
      });
      return row === null ? null : toVendorApplication(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findById(id: string): Promise<VendorApplication | null> {
    try {
      const row = await this.db.client.vendorApplication.findUnique({
        where: { id },
        include: WITH_DOCUMENTS,
      });
      return row === null ? null : toVendorApplication(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async list(
    filter: Readonly<{ status?: VendorApplicationStatus }>,
    page: PageRequest,
  ): Promise<Page<VendorApplication>> {
    try {
      const rows = await this.db.client.vendorApplication.findMany({
        where: { ...filter, ...keysetAfter(page.cursor) },
        orderBy: [...KEYSET_ORDER],
        take: page.limit + 1,
        include: WITH_DOCUMENTS,
      });
      return toPage(rows.map(toVendorApplication), page.limit);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async markApproved(
    id: string,
    reviewerId: string,
  ): Promise<VendorApplication | null> {
    return this.review(id, {
      status: 'approved',
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    });
  }

  async markRejected(
    id: string,
    reviewerId: string,
    reason: string,
  ): Promise<VendorApplication | null> {
    return this.review(id, {
      status: 'rejected',
      rejectionReason: reason,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    });
  }

  async deleteUnapprovedOf(applicantId: string): Promise<number> {
    try {
      // The documents' rows go with them (ON DELETE CASCADE); their files are the
      // caller's to discard.
      const { count } = await this.db.client.vendorApplication.deleteMany({
        where: { applicantId, status: { in: ['pending', 'rejected'] } },
      });
      return count;
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async approvedDocumentMediaIdsOf(applicantId: string): Promise<string[]> {
    try {
      const rows = await this.db.client.vendorApplicationDocument.findMany({
        where: { application: { applicantId, status: 'approved' } },
        select: { mediaId: true },
      });
      return rows.map((row) => row.mediaId);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /** The conditional update from pending; null when it matched nothing. */
  private async review(
    id: string,
    data: {
      status: 'approved' | 'rejected';
      rejectionReason?: string;
      reviewedById: string;
      reviewedAt: Date;
    },
  ): Promise<VendorApplication | null> {
    try {
      const { count } = await this.db.client.vendorApplication.updateMany({
        where: { id, status: 'pending' },
        data,
      });
      return count === 1 ? this.findById(id) : null;
    } catch (error) {
      mapPrismaError(error);
    }
  }
}
