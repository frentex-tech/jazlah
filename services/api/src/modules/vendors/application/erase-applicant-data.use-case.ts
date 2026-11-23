import { Inject, Injectable } from '@nestjs/common';
import {
  VENDOR_APPLICATION_REPOSITORY,
  type VendorApplicationRepository,
} from '../domain/ports/vendor-application.repository.port';
import {
  VENDOR_MEDIA,
  type VendorMedia,
} from '../domain/ports/vendor-media.port';

/**
 * Removes what an applicant gave us when their account is deleted (the account deletion
 * in the auth module calls it):
 *
 * 1. Every pending or rejected application of theirs, with its documents' rows. These
 *    are a person's request, not a business: nothing else refers to them.
 * 2. Every `vendor.document` file they uploaded, marked for the media cleanup job,
 *    except the documents of an approved application: an approved application is the
 *    business record of the vendor it created, and is kept with its documents.
 *
 * Database only: it runs inside the caller's transaction, after the account's row is
 * locked, so nothing is removed if the deletion rolls back, and the storage objects go
 * after the commit (the cleanup job). An approval racing it is decided by the locks: the
 * approval finds its application gone, or the deletion finds the new vendor access and
 * refuses.
 */
@Injectable()
export class EraseApplicantDataUseCase {
  constructor(
    @Inject(VENDOR_APPLICATION_REPOSITORY)
    private readonly applications: VendorApplicationRepository,
    @Inject(VENDOR_MEDIA) private readonly media: VendorMedia,
  ) {}

  async execute(applicantId: string): Promise<void> {
    const kept =
      await this.applications.approvedDocumentMediaIdsOf(applicantId);
    await this.applications.deleteUnapprovedOf(applicantId);
    await this.media.discardDocumentsOf(applicantId, kept);
  }
}
