import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  CATEGORY,
  MEAT_TYPE,
  UNKNOWN,
  seedCatalog,
} from './catalog-test-data.fake';

describe('UpdateReferenceItemUseCase', () => {
  it('renames an entry and switches it off, leaving out what is not given', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);

    const renamed = await kit.updateReferenceItem.execute(
      'categories',
      CATEGORY,
      {
        name: { ar: 'مشاوي', en: 'Grills' },
      },
    );
    const off = await kit.updateReferenceItem.execute('categories', CATEGORY, {
      isActive: false,
    });

    expect(renamed).toMatchObject({ name: { en: 'Grills' }, isActive: true });
    expect(off).toMatchObject({ name: { en: 'Grills' }, isActive: false });
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
    );

    expect(moved.sortOrder).toBe(7);
    await expect(
      kit.updateReferenceItem.execute('meat_types', MEAT_TYPE, {
        sortOrder: 1,
      }),
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
        kit.updateReferenceItem.execute(list, id, { isActive: false }),
      ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    }
  });
});
