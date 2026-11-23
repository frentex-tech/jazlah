import type { Page } from '@common/pagination/page.type';
import type { CatalogMedia } from '../domain/ports/catalog-media.port';
import type { CatalogVendors } from '../domain/ports/catalog-vendors.port';
import type { ProductSummary } from '../domain/product-summary.type';
import type { ProductCard } from './product-card.type';

/** A page of summaries as cards: one read for the cover URLs, one for the vendor names. */
export async function toProductCards(
  page: Page<ProductSummary>,
  media: CatalogMedia,
  vendors: CatalogVendors,
): Promise<Page<ProductCard>> {
  const covers = page.items.flatMap((item) =>
    item.coverMediaId === null ? [] : [item.coverMediaId],
  );
  const [urls, names] = await Promise.all([
    media.publicUrls(covers),
    vendors.namesOf(page.items.map((item) => item.vendorId)),
  ]);
  return {
    items: page.items.map((summary) => ({
      summary,
      coverUrl:
        summary.coverMediaId === null
          ? null
          : (urls.get(summary.coverMediaId) ?? null),
      vendorName: names.get(summary.vendorId) ?? null,
    })),
    nextCursor: page.nextCursor,
  };
}
