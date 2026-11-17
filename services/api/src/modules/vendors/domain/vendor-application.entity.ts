import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { FieldError } from '@common/errors/field-error.type';
import type { VendorApplicationDocument } from './vendor-application-document.type';
import { REQUIRED_VENDOR_APPLICATION_DOCUMENT_KINDS } from './required-vendor-application-document-kinds.constants';
import { VENDOR_APPLICATION_DOCUMENT_LIMITS } from './vendor-application-document-limits.constants';
import type { VendorApplicationStatus } from './vendor-application-status.type';
import type { VendorBusinessDetails } from './vendor-business-details.type';

/**
 * A customer's request to become a vendor: the business details, the IBAN (kept only
 * encrypted; `ibanLast4` here), the documents, and the review. Its status changes only
 * through VendorApplicationReviewMachine.
 */
export class VendorApplication {
  constructor(
    readonly id: string,
    readonly applicantId: string,
    readonly details: VendorBusinessDetails,
    readonly ibanLast4: string,
    readonly status: VendorApplicationStatus,
    /** Null unless rejected. */
    readonly rejectionReason: string | null,
    /** Null while pending. */
    readonly reviewedById: string | null,
    /** Null while pending. */
    readonly reviewedAt: Date | null,
    readonly documents: readonly VendorApplicationDocument[],
    readonly createdAt: Date,
  ) {}

  /**
   * The rules on the documents of a new application: at least one of each required kind
   * (REQUIRED_VENDOR_APPLICATION_DOCUMENT_KINDS; the other kinds are optional), each file once, at
   * most VENDOR_APPLICATION_DOCUMENT_LIMITS.max in all. Throws VALIDATION_FAILED with a
   * field error on `documents` naming the failed rules.
   */
  static assertDocuments(
    documents: readonly VendorApplicationDocument[],
  ): void {
    const failed: string[] = [];
    const kinds = new Set(documents.map((document) => document.kind));
    if (
      REQUIRED_VENDOR_APPLICATION_DOCUMENT_KINDS.some(
        (kind) => !kinds.has(kind),
      )
    ) {
      failed.push('requiresEachDocumentKind');
    }
    if (
      new Set(documents.map((document) => document.mediaId)).size !==
      documents.length
    ) {
      failed.push('uniqueFiles');
    }
    if (documents.length > VENDOR_APPLICATION_DOCUMENT_LIMITS.max) {
      failed.push('arrayMaxSize');
    }
    if (failed.length > 0) {
      const details: FieldError[] = [
        { field: 'documents', constraints: failed },
      ];
      throw new AppError(ErrorCode.VALIDATION_FAILED, { details });
    }
  }
}
