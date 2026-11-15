import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import { CATEGORY, UNKNOWN, seedCatalog } from './catalog-test-data.fake';

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
