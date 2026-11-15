import { ErrorCode } from '@common/errors/error-code.enum';
import { Money } from '@common/money/money';
import { Product } from '../domain/product.entity';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import type { CatalogKit } from './catalog-use-cases.fake';
import {
  ADMIN,
  OTHER_IMAGE,
  UNKNOWN,
  VENDOR,
  VENDOR_USER,
  publishedVendorProduct,
  seedCatalog,
} from './catalog-test-data.fake';

async function withPendingEdit(kit: CatalogKit) {
  const live = await publishedVendorProduct(kit);
  const current = Product.contentOf(live.product);
  const view = await kit.updateContent.execute({
    scope: { kind: 'vendor', vendorId: VENDOR },
    actorId: VENDOR_USER,
    productId: live.product.id,
    content: {
      ...current,
      name: { ar: 'نعيمي بلدي', en: 'Local Naimi' },
      imageMediaIds: [OTHER_IMAGE],
      sizes: [
        ...current.sizes,
        {
          id: null,
          approxWeightGrams: 4_000,
          price: Money.of(50_000),
          tag: null,
        },
      ],
    },
  });
  kit.audit.rows = [];
  return { live, request: view.changeRequest! };
}

describe('ApproveProductChangeRequestUseCase', () => {
  it('applies the request in one go: content, new size, lowest price, decision, audit', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const { live, request } = await withPendingEdit(kit);

    const view = await kit.approveChangeRequest.execute({
      reviewerId: ADMIN,
      requestId: request.id,
    });

    expect(view.product).toMatchObject({
      id: live.product.id,
      status: 'published',
      name: { en: 'Local Naimi' },
      imageMediaIds: [OTHER_IMAGE],
    });
    expect(view.product.sizes).toHaveLength(2);
    expect(view.product.sizes[0]?.id).toBe(live.product.sizes[0]?.id);
    expect(view.product.minPrice?.halalas).toBe(50_000);
    expect(kit.changeRequests.rows[0]?.status).toBe('approved');
    expect(kit.audit.rows).toEqual([
      {
        actorId: ADMIN,
        action: 'catalog.change_request.approved',
        entity: 'product_change_request',
        entityId: request.id,
        metadata: { productId: live.product.id },
      },
    ]);
  });

  it('keeps a price changed after the request was made', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const { live, request } = await withPendingEdit(kit);
    const sizeId = live.product.sizes[0].id;
    await kit.changePrices.execute({
      scope: { kind: 'vendor', vendorId: VENDOR },
      actorId: VENDOR_USER,
      productId: live.product.id,
      changes: { sizes: [{ sizeId, price: Money.of(99_000) }], cuttings: [] },
    });

    const view = await kit.approveChangeRequest.execute({
      reviewerId: ADMIN,
      requestId: request.id,
    });

    expect(view.product.sizes[0]?.price.halalas).toBe(99_000);
  });

  it('answers NOT_FOUND for an unknown or already decided request', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const { request } = await withPendingEdit(kit);
    await kit.approveChangeRequest.execute({
      reviewerId: ADMIN,
      requestId: request.id,
    });

    for (const requestId of [request.id, UNKNOWN]) {
      await expect(
        kit.approveChangeRequest.execute({ reviewerId: ADMIN, requestId }),
      ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    }
  });

  it('rolls everything back when the decision loses to another one', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const { live, request } = await withPendingEdit(kit);
    kit.changeRequests.decide = () => Promise.resolve(false);

    await expect(
      kit.approveChangeRequest.execute({
        reviewerId: ADMIN,
        requestId: request.id,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PRODUCT_NOT_EDITABLE });
    expect(kit.products.rows[0]?.content.name.en).toBe(live.product.name.en);
    expect(kit.audit.rows).toEqual([]);
  });
});
