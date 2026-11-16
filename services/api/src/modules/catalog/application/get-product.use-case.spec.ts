import { ErrorCode } from '@common/errors/error-code.enum';
import { Product } from '../domain/product.entity';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  OTHER_VENDOR,
  UNKNOWN,
  VENDOR,
  VENDOR_USER,
  publishedVendorProduct,
  seedCatalog,
} from './catalog-test-data.fake';

describe('GetProductUseCase', () => {
  it('reads the vendor its own product with its latest change request', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    await kit.updateContent.execute({
      scope: { kind: 'vendor', vendorId: VENDOR },
      actorId: VENDOR_USER,
      productId: live.product.id,
      content: {
        ...Product.contentOf(live.product),
        name: { ar: 'ج', en: 'New' },
      },
    });

    const view = await kit.getProduct.execute(
      { kind: 'vendor', vendorId: VENDOR },
      live.product.id,
    );

    expect(view.product.name.en).toBe('Naimi lamb');
    expect(view.changeRequest?.content.name.en).toBe('New');
  });

  it("answers NOT_FOUND for another vendor's product exactly like a missing one; admins read any", async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    const other = { kind: 'vendor', vendorId: OTHER_VENDOR } as const;

    await expect(
      kit.getProduct.execute(other, live.product.id),
    ).rejects.toEqual(
      await kit.getProduct
        .execute(other, UNKNOWN)
        .catch((error: unknown) => error),
    );
    await expect(
      kit.getProduct.execute(other, live.product.id),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    await expect(
      kit.getProduct.execute({ kind: 'any' }, live.product.id),
    ).resolves.toMatchObject({ product: { id: live.product.id } });
  });
});
