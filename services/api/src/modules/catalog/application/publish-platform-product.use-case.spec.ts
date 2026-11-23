import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  ADMIN,
  ADMIN_IMAGE,
  content,
  seedCatalog,
  vendorDraft,
} from './catalog-test-data.fake';
import type { CatalogKit } from './catalog-use-cases.fake';

function platformDraft(kit: CatalogKit, imageMediaIds = [ADMIN_IMAGE]) {
  return kit.createProduct.execute({
    scope: { kind: 'platform' },
    actorId: ADMIN,
    fulfilment: 'delivery',
    content: content({ imageMediaIds }),
  });
}

describe('PublishPlatformProductUseCase', () => {
  it('publishes a JAZLA draft directly, audited', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await platformDraft(kit);

    const view = await kit.publishPlatformProduct.execute({
      actorId: ADMIN,
      productId: draft.product.id,
    });

    expect(view.product.status).toBe('published');
    expect(view.product.publishedAt).toEqual(expect.any(Date));
    expect(kit.audit.rows).toEqual([
      {
        actorId: ADMIN,
        action: 'catalog.product.published',
        entity: 'product',
        entityId: draft.product.id,
      },
    ]);
  });

  it('refuses an incomplete draft with PRODUCT_NOT_SUBMITTABLE', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await platformDraft(kit, []);

    await expect(
      kit.publishPlatformProduct.execute({
        actorId: ADMIN,
        productId: draft.product.id,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PRODUCT_NOT_SUBMITTABLE });
    expect(kit.audit.rows).toEqual([]);
  });

  it('refuses publishing twice with PRODUCT_NOT_EDITABLE', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await platformDraft(kit);
    const publish = () =>
      kit.publishPlatformProduct.execute({
        actorId: ADMIN,
        productId: draft.product.id,
      });
    await publish();

    await expect(publish()).rejects.toMatchObject({
      code: ErrorCode.PRODUCT_NOT_EDITABLE,
      details: { status: 'published' },
    });
  });

  it("answers NOT_FOUND for a vendor's product: admins publish JAZLA's only", async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);

    await expect(
      kit.publishPlatformProduct.execute({
        actorId: ADMIN,
        productId: draft.product.id,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
