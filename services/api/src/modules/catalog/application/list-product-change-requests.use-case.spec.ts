import { Product } from '../domain/product.entity';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  ADMIN,
  IMAGE,
  VENDOR,
  VENDOR_USER,
  publishedVendorProduct,
  seedCatalog,
} from './catalog-test-data.fake';

describe('ListProductChangeRequestsUseCase', () => {
  it('lists the pending requests only, newest first, with the URLs of their images', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const first = await publishedVendorProduct(kit);
    const second = await publishedVendorProduct(kit);
    const edit = (live: typeof first) =>
      kit.updateContent.execute({
        scope: { kind: 'vendor', vendorId: VENDOR },
        actorId: VENDOR_USER,
        productId: live.product.id,
        content: {
          ...Product.contentOf(live.product),
          name: { ar: 'ج', en: 'New' },
        },
      });
    const decided = await edit(first);
    const waiting = await edit(second);
    await kit.rejectChangeRequest.execute({
      reviewerId: ADMIN,
      requestId: decided.changeRequest!.id,
      reason: 'r',
    });

    const { page, imageUrls } = await kit.listChangeRequests.execute({
      cursor: null,
      limit: 20,
    });

    expect(page.items.map((request) => request.id)).toEqual([
      waiting.changeRequest!.id,
    ]);
    expect([...imageUrls.keys()]).toEqual(page.items[0]?.content.imageMediaIds);
    expect(imageUrls.get(IMAGE)).toBe(`https://cdn.example.invalid/${IMAGE}`);
  });
});
