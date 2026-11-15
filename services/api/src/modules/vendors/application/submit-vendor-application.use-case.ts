import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { FieldError } from '@common/errors/field-error.type';
import { Iban } from '../domain/iban';
import { IBAN_CIPHER, type IbanCipher } from '../domain/ports/iban-cipher.port';
import {
  VENDOR_APPLICATION_REPOSITORY,
  type VendorApplicationRepository,
} from '../domain/ports/vendor-application.repository.port';
import {
  VENDOR_MEDIA,
  type VendorMedia,
} from '../domain/ports/vendor-media.port';
import { VendorApplication } from '../domain/vendor-application.entity';
import type { VendorApplicationDocument } from '../domain/vendor-application-document.type';
import type { SubmitVendorApplicationInput } from './submit-vendor-application-input.type';

/** The upload purpose of every application document. */
const DOCUMENT_PURPOSE = 'vendor.document';

/**
 * A signed-in customer applies to become a vendor (FR-VND-01).
 *
 * 1. The documents follow the rules (VendorApplication.assertDocuments).
 * 2. The IBAN is a valid Saudi IBAN (the DTO checked it already; this is the domain's
 *    own guard), or VALIDATION_FAILED on `iban`.
 * 3. Each document is a `vendor.document` file the applicant uploaded, or
 *    MEDIA_NOT_FOUND (another user's file is answered as missing), and it is ready, or
 *    MEDIA_NOT_READY.
 * 4. The IBAN is encrypted and the application stored, pending, with its documents in
 *    one statement: a second pending application of the same applicant is
 *    VENDOR_APPLICATION_ALREADY_PENDING, even when both arrive at once.
 */
@Injectable()
export class SubmitVendorApplicationUseCase {
  constructor(
    @Inject(VENDOR_APPLICATION_REPOSITORY)
    private readonly applications: VendorApplicationRepository,
    @Inject(VENDOR_MEDIA) private readonly media: VendorMedia,
    @Inject(IBAN_CIPHER) private readonly cipher: IbanCipher,
  ) {}

  async execute(
    input: SubmitVendorApplicationInput,
  ): Promise<VendorApplication> {
    VendorApplication.assertDocuments(input.documents);
    const iban = Iban.parse(input.iban);
    if (iban === null) {
      const details: FieldError[] = [
        { field: 'iban', constraints: ['isSaudiIban'] },
      ];
      throw new AppError(ErrorCode.VALIDATION_FAILED, { details });
    }
    await this.assertOwnReadyDocuments(input.applicantId, input.documents);
    return this.applications.create({
      applicantId: input.applicantId,
      details: input.details,
      iban: this.cipher.seal(iban),
      documents: input.documents,
    });
  }

  private async assertOwnReadyDocuments(
    applicantId: string,
    documents: readonly VendorApplicationDocument[],
  ): Promise<void> {
    const files = new Map(
      (
        await this.media.findFiles(
          documents.map((document) => document.mediaId),
        )
      ).map((file) => [file.id, file]),
    );
    for (const { mediaId } of documents) {
      const file = files.get(mediaId);
      if (
        file === undefined ||
        file.ownerId !== applicantId ||
        file.purpose !== DOCUMENT_PURPOSE
      ) {
        throw new AppError(ErrorCode.MEDIA_NOT_FOUND, { details: { mediaId } });
      }
      if (!file.isReady) {
        throw new AppError(ErrorCode.MEDIA_NOT_READY, { details: { mediaId } });
      }
    }
  }
}
