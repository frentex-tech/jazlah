import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  CATEGORY,
  IMAGE,
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
  });

  it('answers NOT_FOUND when unavailable, its vendor suspended or its category inactive', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    const read = () => kit.getPublicProduct.execute(live.product.id);

    await kit.setAvailability.execute({
      scope: { kind: 'vendor', vendorId: VENDOR },
      productId: live.product.id,
      isAvailable: false,
    });
    await expect(read()).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    await kit.setAvailability.execute({
      scope: { kind: 'vendor', vendorId: VENDOR },
      productId: live.product.id,
      isAvailable: true,
    });
    kit.products.suspendedVendors.add(VENDOR);
    await expect(read()).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    kit.products.suspendedVendors.clear();
    await kit.updateReferenceItem.execute('categories', CATEGORY, {
      isActive: false,
    });
    await expect(read()).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
