import { ADMIN } from './catalog-test-data.fake';
import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import { CUT, UNKNOWN, seedCatalog } from './catalog-test-data.fake';

describe('CreateCuttingPackagingIncompatibilityUseCase', () => {
  it('adds a rule on an active cutting style', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);

    const rule = await kit.createIncompatibility.execute(CUT, 'vacuum');

    expect(rule).toMatchObject({ cuttingStyleId: CUT, packaging: 'vacuum' });
  });

  it('refuses an unknown or inactive cutting style on cuttingStyleId', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    await kit.updateReferenceItem.execute(
      'cutting_styles',
      CUT,
      {
        isActive: false,
      },
      ADMIN,
    );

    for (const id of [UNKNOWN, CUT]) {
      await expect(
        kit.createIncompatibility.execute(id, 'bags'),
      ).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
        details: [{ field: 'cuttingStyleId' }],
      });
    }
    expect(kit.rules.rows).toEqual([]);
  });

  it('refuses the same pair twice with CONFLICT', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    await kit.createIncompatibility.execute(CUT, 'vacuum');

    await expect(
      kit.createIncompatibility.execute(CUT, 'vacuum'),
    ).rejects.toMatchObject({ code: ErrorCode.CONFLICT });
  });
});
