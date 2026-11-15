import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  ADMIN,
  UNKNOWN,
  VENDOR,
  seedCatalog,
  vendorDraft,
} from './catalog-test-data.fake';

describe('ApproveProductUseCase', () => {
  it('publishes a product under review, audited', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);
    await kit.submitProduct.execute({
      vendorId: VENDOR,
      productId: draft.product.id,
    });

    const view = await kit.approveProduct.execute({
      reviewerId: ADMIN,
      productId: draft.product.id,
    });

    expect(view.product).toMatchObject({ status: 'published' });
    expect(view.product.publishedAt).toEqual(expect.any(Date));
    expect(view.product.reviewedAt).toEqual(expect.any(Date));
    expect(kit.audit.rows).toEqual([
      {
        actorId: ADMIN,
        action: 'catalog.product.approved',
        entity: 'product',
        entityId: draft.product.id,
      },
    ]);
  });

  it('refuses a draft (not submitted) and a second approval with PRODUCT_NOT_EDITABLE', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);
    const approve = () =>
      kit.approveProduct.execute({
        reviewerId: ADMIN,
        productId: draft.product.id,
      });

    await expect(approve()).rejects.toMatchObject({
      code: ErrorCode.PRODUCT_NOT_EDITABLE,
      details: { status: 'draft' },
    });
    await kit.submitProduct.execute({
      vendorId: VENDOR,
      productId: draft.product.id,
    });
    await approve();
    await expect(approve()).rejects.toMatchObject({
      code: ErrorCode.PRODUCT_NOT_EDITABLE,
      details: { status: 'published' },
    });
    expect(kit.audit.rows).toHaveLength(1);
  });

  it('answers NOT_FOUND for an unknown product', async () => {
    const kit = buildCatalogUseCases();

    await expect(
      kit.approveProduct.execute({ reviewerId: ADMIN, productId: UNKNOWN }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
