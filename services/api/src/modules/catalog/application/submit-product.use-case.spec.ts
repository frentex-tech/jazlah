import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  ADMIN,
  CUT,
  OTHER_VENDOR,
  VENDOR,
  seedCatalog,
  vendorDraft,
} from './catalog-test-data.fake';

describe('SubmitProductUseCase', () => {
  it('sends a complete draft to review', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);

    const view = await kit.submitProduct.execute({
      vendorId: VENDOR,
      productId: draft.product.id,
    });

    expect(view.product.status).toBe('pending_review');
    expect(view.product.submittedAt).toEqual(expect.any(Date));
  });

  it('sends a rejected product again, clearing the reason', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);
    await kit.submitProduct.execute({
      vendorId: VENDOR,
      productId: draft.product.id,
    });
    await kit.rejectProduct.execute({
      reviewerId: ADMIN,
      productId: draft.product.id,
      reason: 'Blurry photo',
    });

    const view = await kit.submitProduct.execute({
      vendorId: VENDOR,
      productId: draft.product.id,
    });

    expect(view.product).toMatchObject({
      status: 'pending_review',
      rejectionReason: null,
    });
  });

  it('refuses a draft without a size and an image with PRODUCT_NOT_SUBMITTABLE', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit, { sizes: [], imageMediaIds: [] });

    await expect(
      kit.submitProduct.execute({
        vendorId: VENDOR,
        productId: draft.product.id,
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.PRODUCT_NOT_SUBMITTABLE,
      details: { reasons: ['NO_SIZE', 'NO_IMAGE'] },
    });
    expect(kit.products.rows[0]?.status).toBe('draft');
  });

  it('refuses an incompatible cutting and packaging pair', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    await kit.createIncompatibility.execute(CUT, 'trays');
    const draft = await vendorDraft(kit);

    await expect(
      kit.submitProduct.execute({
        vendorId: VENDOR,
        productId: draft.product.id,
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.PRODUCT_NOT_SUBMITTABLE,
      details: { pairs: [{ cuttingStyleId: CUT, packaging: 'trays' }] },
    });
  });

  it('refuses a product under review or published with PRODUCT_NOT_EDITABLE', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);
    const submit = () =>
      kit.submitProduct.execute({
        vendorId: VENDOR,
        productId: draft.product.id,
      });
    await submit();

    await expect(submit()).rejects.toMatchObject({
      code: ErrorCode.PRODUCT_NOT_EDITABLE,
    });
    await kit.approveProduct.execute({
      reviewerId: ADMIN,
      productId: draft.product.id,
    });
    await expect(submit()).rejects.toMatchObject({
      code: ErrorCode.PRODUCT_NOT_EDITABLE,
    });
  });

  it("answers NOT_FOUND for another vendor's product", async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);

    await expect(
      kit.submitProduct.execute({
        vendorId: OTHER_VENDOR,
        productId: draft.product.id,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
