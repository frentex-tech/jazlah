import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  OTHER_VENDOR,
  UNKNOWN,
  VENDOR,
  publishedVendorProduct,
  seedCatalog,
  vendorDraft,
} from './catalog-test-data.fake';

describe('SetProductAvailabilityUseCase', () => {
  it('switches a published product off at once, with no change request', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);

    const view = await kit.setAvailability.execute({
      scope: { kind: 'vendor', vendorId: VENDOR },
      productId: live.product.id,
      isAvailable: false,
      sizes: [],
    });

    expect(view.product).toMatchObject({
      status: 'published',
      isAvailable: false,
    });
    expect(kit.changeRequests.rows).toEqual([]);
  });

  it('switches one size off at once, keeping it on the product; a size of another product is refused', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    const sizeId = live.product.sizes[0]?.id ?? '';

    const view = await kit.setAvailability.execute({
      scope: { kind: 'vendor', vendorId: VENDOR },
      productId: live.product.id,
      isAvailable: true,
      sizes: [{ sizeId, isAvailable: false }],
    });

    expect(view.product).toMatchObject({
      isAvailable: true,
      sizes: [{ id: sizeId, isAvailable: false }],
    });
    await expect(
      kit.setAvailability.execute({
        scope: { kind: 'vendor', vendorId: VENDOR },
        productId: live.product.id,
        isAvailable: true,
        sizes: [{ sizeId: UNKNOWN, isAvailable: false }],
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [{ field: 'sizes.0.sizeId', constraints: ['isSizeOfProduct'] }],
    });
  });

  it('refuses a product under review, and answers NOT_FOUND for another vendor', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);
    await kit.submitProduct.execute({
      vendorId: VENDOR,
      productId: draft.product.id,
    });

    await expect(
      kit.setAvailability.execute({
        scope: { kind: 'vendor', vendorId: VENDOR },
        productId: draft.product.id,
        isAvailable: false,
        sizes: [],
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PRODUCT_NOT_EDITABLE });
    await expect(
      kit.setAvailability.execute({
        scope: { kind: 'vendor', vendorId: OTHER_VENDOR },
        productId: draft.product.id,
        isAvailable: false,
        sizes: [],
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
