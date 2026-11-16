import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  OTHER_VENDOR,
  VENDOR,
  publishedVendorProduct,
  seedCatalog,
  vendorDraft,
} from './catalog-test-data.fake';

describe('SetProductFulfilmentUseCase', () => {
  it('changes a published product to pickup only, at once', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);

    const view = await kit.setFulfilment.execute({
      scope: { kind: 'vendor', vendorId: VENDOR },
      productId: live.product.id,
      fulfilment: 'pickup',
    });

    expect(view.product).toMatchObject({
      status: 'published',
      fulfilment: 'pickup',
    });
    expect(kit.changeRequests.rows).toEqual([]);
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
      kit.setFulfilment.execute({
        scope: { kind: 'vendor', vendorId: VENDOR },
        productId: draft.product.id,
        fulfilment: 'pickup',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PRODUCT_NOT_EDITABLE });
    await expect(
      kit.setFulfilment.execute({
        scope: { kind: 'vendor', vendorId: OTHER_VENDOR },
        productId: draft.product.id,
        fulfilment: 'pickup',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
