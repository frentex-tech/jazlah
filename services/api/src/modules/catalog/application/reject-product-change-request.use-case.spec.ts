import { ErrorCode } from '@common/errors/error-code.enum';
import { Product } from '../domain/product.entity';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  ADMIN,
  UNKNOWN,
  VENDOR,
  VENDOR_USER,
  publishedVendorProduct,
  seedCatalog,
} from './catalog-test-data.fake';

describe('RejectProductChangeRequestUseCase', () => {
  it('discards the edit with a reason the vendor sees; the live product is unchanged', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    const edited = await kit.updateContent.execute({
      scope: { kind: 'vendor', vendorId: VENDOR },
      actorId: VENDOR_USER,
      productId: live.product.id,
      content: {
        ...Product.contentOf(live.product),
        name: { ar: 'ج', en: 'New' },
      },
    });
    kit.audit.rows = [];

    await kit.rejectChangeRequest.execute({
      reviewerId: ADMIN,
      requestId: edited.changeRequest!.id,
      reason: 'Keep the old name',
    });

    const view = await kit.getProduct.execute(
      { kind: 'vendor', vendorId: VENDOR },
      live.product.id,
    );
    expect(view.product.name.en).toBe('Naimi lamb');
    expect(view.changeRequest).toMatchObject({
      status: 'rejected',
      rejectionReason: 'Keep the old name',
    });
    expect(kit.audit.rows).toEqual([
      expect.objectContaining({ action: 'catalog.change_request.rejected' }),
    ]);
  });

  it('answers NOT_FOUND for an unknown request', async () => {
    const kit = buildCatalogUseCases();

    await expect(
      kit.rejectChangeRequest.execute({
        reviewerId: ADMIN,
        requestId: UNKNOWN,
        reason: 'r',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
