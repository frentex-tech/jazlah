import { ADMIN } from './catalog-test-data.fake';
import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  CATEGORY,
  MEAT_TYPE,
  UNKNOWN,
  seedCatalog,
} from './catalog-test-data.fake';

describe('UpdateReferenceItemUseCase', () => {
  it("sets a category's image, then clears it with null", async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const image = '00000000-0000-4000-8000-00000000c1a2';
    kit.media.add({
      id: image,
      ownerId: ADMIN,
      purpose: 'catalog.category-image',
      isReady: true,
    });

    const set = await kit.updateReferenceItem.execute(
      'categories',
      CATEGORY,
      { imageMediaId: image },
      ADMIN,
    );
    const cleared = await kit.updateReferenceItem.execute(
      'categories',
      CATEGORY,
      { imageMediaId: null },
      ADMIN,
    );

    expect(set.imageUrl).toBe(`https://cdn.example.invalid/${image}`);
    expect(cleared).toMatchObject({
      item: { imageMediaId: null },
      imageUrl: null,
    });
    await expect(
      kit.updateReferenceItem.execute(
        'cutting_styles',
        'any',
        { imageMediaId: null },
        ADMIN,
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [{ field: 'imageMediaId', constraints: ['isCategoryList'] }],
    });
  });

  it('renames an entry and switches it off, leaving out what is not given', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);

    const renamed = await kit.updateReferenceItem.execute(
      'categories',
      CATEGORY,
      {
        name: { ar: 'مشاوي', en: 'Grills' },
      },
      ADMIN,
    );
    const off = await kit.updateReferenceItem.execute(
      'categories',
      CATEGORY,
      {
        isActive: false,
      },
      ADMIN,
    );

    expect(renamed.item).toMatchObject({
      name: { en: 'Grills' },
      isActive: true,
    });
    expect(off.item).toMatchObject({
      name: { en: 'Grills' },
      isActive: false,
    });
  });

  it('reorders a category, and refuses a display order on another list', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);

    const moved = await kit.updateReferenceItem.execute(
      'categories',
      CATEGORY,
      {
        sortOrder: 7,
      },
      ADMIN,
    );

    expect(moved.item.sortOrder).toBe(7);
    await expect(
      kit.updateReferenceItem.execute(
        'meat_types',
        MEAT_TYPE,
        {
          sortOrder: 1,
        },
        ADMIN,
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [{ field: 'sortOrder', constraints: ['isOrderedList'] }],
    });
  });

  it('answers NOT_FOUND for an unknown id, or an id of another list', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);

    for (const [list, id] of [
      ['categories', UNKNOWN],
      ['meat_types', CATEGORY],
    ] as const) {
      await expect(
        kit.updateReferenceItem.execute(list, id, { isActive: false }, ADMIN),
      ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    }
  });
});
