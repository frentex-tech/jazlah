import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  ADMIN,
  UNKNOWN,
  VENDOR,
  seedCatalog,
  vendorDraft,
} from './catalog-test-data.fake';

describe('RejectProductUseCase', () => {
  it('rejects a product under review with a reason the vendor sees, audited', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);
    await kit.submitProduct.execute({
      vendorId: VENDOR,
      productId: draft.product.id,
    });

    const view = await kit.rejectProduct.execute({
      reviewerId: ADMIN,
      productId: draft.product.id,
      reason: 'The photo is blurry',
    });

    expect(view.product).toMatchObject({
      status: 'rejected',
      rejectionReason: 'The photo is blurry',
    });
    expect(kit.audit.rows).toEqual([
      expect.objectContaining({ action: 'catalog.product.rejected' }),
    ]);
  });

  it('refuses a product not under review with PRODUCT_NOT_EDITABLE, and NOT_FOUND for an unknown one', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);

    await expect(
      kit.rejectProduct.execute({
        reviewerId: ADMIN,
        productId: draft.product.id,
        reason: 'r',
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.PRODUCT_NOT_EDITABLE,
      details: { status: 'draft' },
    });
    await expect(
      kit.rejectProduct.execute({
        reviewerId: ADMIN,
        productId: UNKNOWN,
        reason: 'r',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    expect(kit.audit.rows).toEqual([]);
  });
});
