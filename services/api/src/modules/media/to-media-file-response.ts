import type { MediaFileResponseDto } from './dto/media-file-response.dto';
import type { MediaFile } from './media-file.type';

/** A ready file as the confirm response; confirmUpload only ever returns ready files. */
export function toMediaFileResponse(file: MediaFile): MediaFileResponseDto {
  if (
    file.status !== 'ready' ||
    file.sizeBytes === null ||
    file.contentType === null ||
    file.confirmedAt === null
  ) {
    throw new Error(`Media file ${file.id} is not ready`);
  }
  return {
    id: file.id,
    purpose: file.purpose,
    visibility: file.visibility,
    status: file.status,
    sizeBytes: file.sizeBytes,
    contentType: file.contentType,
    originalFileName: file.originalFileName,
    confirmedAt: file.confirmedAt,
  };
}
