import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { FileLink } from '../domain/file-link.type';
import {
  VENDOR_APPLICATION_REPOSITORY,
  type VendorApplicationRepository,
} from '../domain/ports/vendor-application.repository.port';
import {
  VENDOR_MEDIA,
  type VendorMedia,
} from '../domain/ports/vendor-media.port';
import type { VendorApplicationWithLinks } from './vendor-application-with-links.type';

/**
 * One application for an admin reviewing it, with a link to read each document (a
 * presigned URL: the documents are private). NOT_FOUND for an unknown id.
 */
@Injectable()
export class GetVendorApplicationUseCase {
  constructor(
    @Inject(VENDOR_APPLICATION_REPOSITORY)
    private readonly applications: VendorApplicationRepository,
    @Inject(VENDOR_MEDIA) private readonly media: VendorMedia,
  ) {}

  async execute(applicationId: string): Promise<VendorApplicationWithLinks> {
    const application = await this.applications.findById(applicationId);
    if (application === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    const links = await Promise.all(
      application.documents.map(
        async (document): Promise<[string, FileLink]> => [
          document.mediaId,
          await this.media.link(document.mediaId),
        ],
      ),
    );
    return { application, documentLinks: new Map(links) };
  }
}
