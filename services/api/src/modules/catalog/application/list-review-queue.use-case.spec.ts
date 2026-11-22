import { Product } from '../domain/product.entity';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  OTHER_VENDOR,
  VENDOR,
  VENDOR_USER,
  publishedVendorProduct,
  seedCatalog,
  vendorDraft,
} from './catalog-test-data.fake';

const page = { cursor: null, limit: 20 };

/** A queue with one edit of a published product, then one new product submitted. */
async function queueOfTwo() {
  const kit = buildCatalogUseCases();
  seedCatalog(kit);
  const live = await publishedVendorProduct(kit);
  const edit = await kit.updateContent.execute({
    scope: { kind: 'vendor', vendorId: VENDOR },
    actorId: VENDOR_USER,
    productId: live.product.id,
    content: {
      ...Product.contentOf(live.product),
      name: { ar: 'جديد', en: 'New name' },
    },
  });
  const draft = await vendorDraft(kit);
  await kit.submitProduct.execute({
    vendorId: VENDOR,
    productId: draft.product.id,
  });
  return {
    kit,
    liveId: live.product.id,
    requestId: edit.changeRequest?.id ?? '',
    draftId: draft.product.id,
  };
}

describe('ListReviewQueueUseCase', () => {
  it('lists new products and edits together, newest first, with the count and vendor names', async () => {
    const { kit, liveId, requestId, draftId } = await queueOfTwo();

    const result = await kit.listReviewQueue.execute({}, page);

    const items = result.page.items;
    const times = items.map((item) => item.submittedAt.getTime());
    expect(result.count).toBe(2);
    expect(times).toEqual([...times].sort((a, b) => b - a));
    expect(items.find((item) => item.kind === 'change_request')).toMatchObject({
      productId: liveId,
      changeRequestId: requestId,
      name: { ar: 'نعيمي', en: 'Naimi lamb' },
    });
    expect(items.find((item) => item.kind === 'product')).toMatchObject({
      productId: draftId,
      changeRequestId: null,
    });
    expect(result.vendorNames.get(VENDOR)).toEqual({
      ar: 'ملحمة النخبة',
      en: 'Al Nokhba',
    });
  });

  it('filters by kind and by vendor; the count follows the filter', async () => {
    const { kit } = await queueOfTwo();

    const edits = await kit.listReviewQueue.execute(
      { kind: 'change_request' },
      page,
    );
    const others = await kit.listReviewQueue.execute(
      { vendorId: OTHER_VENDOR },
      page,
    );

    expect(edits.count).toBe(1);
    expect(edits.page.items.map((item) => item.kind)).toEqual([
      'change_request',
    ]);
    expect(others).toMatchObject({ count: 0, page: { items: [] } });
  });

  it('pages with a cursor, the count staying the whole queue', async () => {
    const { kit } = await queueOfTwo();
    const all = await kit.listReviewQueue.execute({}, page);

    const first = await kit.listReviewQueue.execute(
      {},
      { cursor: null, limit: 1 },
    );
    const second = await kit.listReviewQueue.execute(
      {},
      { cursor: first.page.nextCursor, limit: 1 },
    );

    expect([...first.page.items, ...second.page.items]).toEqual(all.page.items);
    expect(second.page.nextCursor).toBeNull();
    expect([first.count, second.count]).toEqual([2, 2]);
  });

  it('leaves out decided items: an approved product is no longer waiting', async () => {
    const { kit, draftId } = await queueOfTwo();
    await kit.approveProduct.execute({
      reviewerId: 'admin',
      productId: draftId,
    });

    const result = await kit.listReviewQueue.execute({ kind: 'product' }, page);

    expect(result).toMatchObject({ count: 0, page: { items: [] } });
  });
});
