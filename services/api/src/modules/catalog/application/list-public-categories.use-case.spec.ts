import { buildCatalogUseCases } from './catalog-use-cases.fake';

describe('ListPublicCategoriesUseCase', () => {
  it('lists the active categories by display order, then oldest first', async () => {
    const kit = buildCatalogUseCases();
    const add = (en: string, sortOrder?: number) =>
      kit.createReferenceItem.execute('categories', {
        name: { ar: en, en },
        ...(sortOrder === undefined ? {} : { sortOrder }),
      });
    const grills = await add('Grills', 2);
    const whole = await add('Whole', 1);
    const minced = await add('Minced');
    const cooked = await add('Cooked');
    const hidden = await add('Hidden', 0);
    await kit.updateReferenceItem.execute('categories', hidden.id, {
      isActive: false,
    });
    await kit.createReferenceItem.execute('meat_types', {
      name: { ar: 'حاشي', en: 'Camel' },
    });

    const categories = await kit.listPublicCategories.execute();

    expect(categories.map((item) => item.id)).toEqual([
      minced.id,
      cooked.id,
      whole.id,
      grills.id,
    ]);
    expect(categories.map((item) => item.sortOrder)).toEqual([0, 0, 1, 2]);
  });
});
