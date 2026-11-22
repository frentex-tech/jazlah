import { ADMIN } from './catalog-test-data.fake';
import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  CATEGORY,
  CUT,
  IMAGE,
  OTHER_CUT,
  VENDOR,
  publishedVendorProduct,
  seedCatalog,
} from './catalog-test-data.fake';

describe('GetPublicProductUseCase', () => {
  it('reads a visible product with its options, images and vendor name', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);

    const view = await kit.getPublicProduct.execute(live.product.id);

    expect(view.product.cuttings).toHaveLength(1);
    expect(view.imageUrls.get(IMAGE)).toBe(
      `https://cdn.example.invalid/${IMAGE}`,
    );
    expect(view.vendorName).toEqual({ ar: 'ملحمة النخبة', en: 'Al Nokhba' });
    expect(view.incompatiblePairs).toEqual([]);
  });

  it('lists the rules among the cutting styles and packagings it offers, only those', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    await kit.createIncompatibility.execute(CUT, 'trays');
    await kit.createIncompatibility.execute(CUT, 'vacuum');
    await kit.createIncompatibility.execute(OTHER_CUT, 'trays');

    const view = await kit.getPublicProduct.execute(live.product.id);

    expect(view.incompatiblePairs).toEqual([
      { cuttingStyleId: CUT, packaging: 'trays' },
    ]);
  });

  it('reads an unavailable product, marked so', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    await kit.setAvailability.execute({
      scope: { kind: 'vendor', vendorId: VENDOR },
      productId: live.product.id,
      isAvailable: false,
      sizes: [],
    });

    const view = await kit.getPublicProduct.execute(live.product.id);

    expect(view.product.isAvailable).toBe(false);
  });

  it('answers NOT_FOUND when its vendor is suspended or its category inactive', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    const read = () => kit.getPublicProduct.execute(live.product.id);

    kit.products.suspendedVendors.add(VENDOR);
    await expect(read()).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    kit.products.suspendedVendors.clear();
    await kit.updateReferenceItem.execute(
      'categories',
      CATEGORY,
      {
        isActive: false,
      },
      ADMIN,
    );
    await expect(read()).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
