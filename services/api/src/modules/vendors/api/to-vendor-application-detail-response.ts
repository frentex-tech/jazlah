import type { VendorApplicationWithLinks } from '../application/vendor-application-with-links.type';
import type { VendorApplicationDetailResponseDto } from './dto/vendor-application-detail-response.dto';
import { toVendorApplicationResponse } from './to-vendor-application-response';

/** An application with its document links, for the admin reviewing it. */
export function toVendorApplicationDetailResponse({
  application,
  documentLinks,
}: VendorApplicationWithLinks): VendorApplicationDetailResponseDto {
  return {
    ...toVendorApplicationResponse(application),
    reviewedById: application.reviewedById,
    documents: application.documents.map((document) => {
      const link = documentLinks.get(document.mediaId);
      if (link === undefined) {
        throw new Error(`No link for document ${document.mediaId}`);
      }
      return { ...document, url: link.url, expiresAt: link.expiresAt };
    }),
  };
}
