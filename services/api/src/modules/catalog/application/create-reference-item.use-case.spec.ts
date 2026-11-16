import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';

describe('CreateReferenceItemUseCase', () => {
  it('adds an active entry to the list it names only, with no display order', async () => {
    const kit = buildCatalogUseCases();

    const item = await kit.createReferenceItem.execute('meat_types', {
      name: { ar: 'حاشي', en: 'Camel' },
    });

    expect(item).toMatchObject({
      name: { ar: 'حاشي', en: 'Camel' },
      isActive: true,
      sortOrder: null,
    });
    expect(kit.lists.find('meat_types', item.id)).toEqual(item);
    expect(kit.lists.find('categories', item.id)).toBeUndefined();
  });

  it('gives a category its display order, 0 when left out', async () => {
    const kit = buildCatalogUseCases();

    const ordered = await kit.createReferenceItem.execute('categories', {
      name: { ar: 'ذبائح', en: 'Whole' },
      sortOrder: 3,
    });
    const unordered = await kit.createReferenceItem.execute('categories', {
      name: { ar: 'مفروم', en: 'Minced' },
    });

    expect(ordered.sortOrder).toBe(3);
    expect(unordered.sortOrder).toBe(0);
  });

  it('refuses a display order on a list without one, adding nothing', async () => {
    const kit = buildCatalogUseCases();

    await expect(
      kit.createReferenceItem.execute('exclusion_items', {
        name: { ar: 'بدون رأس', en: 'No head' },
        sortOrder: 1,
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [{ field: 'sortOrder', constraints: ['isOrderedList'] }],
    });
    expect(kit.lists.rows).toEqual([]);
  });
});
