import type { CatalogMedia } from '../domain/ports/catalog-media.port';
import type { ReferenceItem } from '../domain/reference-item.type';
import type { ReferenceItemView } from './reference-item-view.type';

/** The entries with their image URLs, in one read without a storage call. */
export async function toReferenceItemViews(
  items: readonly ReferenceItem[],
  media: CatalogMedia,
): Promise<ReferenceItemView[]> {
  const ids = items.flatMap((item) =>
    item.imageMediaId === null ? [] : [item.imageMediaId],
  );
  const urls =
    ids.length === 0 ? new Map<string, string>() : await media.publicUrls(ids);
  return items.map((item) => ({
    item,
    imageUrl:
      item.imageMediaId === null ? null : (urls.get(item.imageMediaId) ?? null),
  }));
}
