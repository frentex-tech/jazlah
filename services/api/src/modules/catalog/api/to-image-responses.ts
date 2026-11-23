import type { ProductImageResponseDto } from './dto/product-image-response.dto';

/** Image ids with their public URLs (null if a URL is missing). */
export function toImageResponses(
  mediaIds: readonly string[],
  urls: ReadonlyMap<string, string>,
): ProductImageResponseDto[] {
  return mediaIds.map((mediaId) => ({
    mediaId,
    url: urls.get(mediaId) ?? null,
  }));
}
