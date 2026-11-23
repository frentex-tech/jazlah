import { Money } from '@common/money/money';
import type { ProductContent } from '../domain/product-content.type';
import type { ProductView } from './product-view.type';
import type { CatalogKit } from './catalog-use-cases.fake';

/** Ids and content the catalog's use case tests share. */
const id = (n: number): string =>
  `00000000-0000-4000-9000-${String(n).padStart(12, '0')}`;

export const VENDOR = id(1);
export const OTHER_VENDOR = id(2);
export const PLATFORM = id(3);
export const VENDOR_USER = id(10);
export const OTHER_USER = id(11);
export const ADMIN = id(12);
export const CATEGORY = id(20);
export const MEAT_TYPE = id(21);
export const CUT = id(22);
export const OTHER_CUT = id(23);
export const EXCLUSION = id(24);
export const IMAGE = id(30);
export const OTHER_IMAGE = id(31);
export const UNKNOWN = id(99);

/**
 * Seeds the lists, the images (uploaded by VENDOR_USER and ADMIN), the vendor names and
 * the platform vendor every test starts from.
 */
export function seedCatalog(kit: CatalogKit): void {
  kit.lists.seed('categories', CATEGORY);
  kit.lists.seed('meat_types', MEAT_TYPE);
  kit.lists.seed('cutting_styles', CUT);
  kit.lists.seed('cutting_styles', OTHER_CUT);
  kit.lists.seed('exclusion_items', EXCLUSION);
  for (const [mediaId, ownerId] of [
    [IMAGE, VENDOR_USER],
    [OTHER_IMAGE, VENDOR_USER],
    [id(32), ADMIN],
  ] as const) {
    kit.media.add({
      id: mediaId,
      ownerId,
      purpose: 'catalog.product-image',
      isReady: true,
    });
  }
  kit.vendors.platformId = PLATFORM;
  kit.vendors.names.set(VENDOR, { ar: 'ملحمة النخبة', en: 'Al Nokhba' });
  kit.vendors.names.set(PLATFORM, { ar: 'جزلة', en: 'JAZLA' });
}

/** The admin's own image (for JAZLA products). */
export const ADMIN_IMAGE = id(32);

/** A complete content: one image, one size, one cutting, one packaging, one exclusion. */
export function content(
  overrides: Partial<ProductContent> = {},
): ProductContent {
  return {
    name: { ar: 'نعيمي', en: 'Naimi lamb' },
    description: { ar: 'طازج', en: null },
    categoryId: CATEGORY,
    meatTypeId: MEAT_TYPE,
    imageMediaIds: [IMAGE],
    sizes: [
      {
        id: null,
        approxWeightGrams: 8_000,
        price: Money.of(95_000),
        tag: { ar: 'يجزئ العقيقة', en: 'Enough for an aqiqah' },
      },
    ],
    cuttings: [{ cuttingStyleId: CUT, extraPrice: Money.of(1_500) }],
    packagings: [{ packaging: 'trays', extraPrice: Money.of(300) }],
    exclusionItemIds: [EXCLUSION],
    ...overrides,
  };
}

/** A vendor's draft with the complete content. */
export function vendorDraft(
  kit: CatalogKit,
  overrides: Partial<ProductContent> = {},
): Promise<ProductView> {
  return kit.createProduct.execute({
    scope: { kind: 'vendor', vendorId: VENDOR },
    actorId: VENDOR_USER,
    fulfilment: 'both',
    content: content(overrides),
  });
}

/** A vendor's product, submitted and approved: published. */
export async function publishedVendorProduct(
  kit: CatalogKit,
): Promise<ProductView> {
  const draft = await vendorDraft(kit);
  await kit.submitProduct.execute({
    vendorId: VENDOR,
    productId: draft.product.id,
  });
  return kit.approveProduct.execute({
    reviewerId: ADMIN,
    productId: draft.product.id,
  });
}
