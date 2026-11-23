import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { keysetPage } from '@common/pagination/keyset-page.fake';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { CuttingPackagingIncompatibility } from '../cutting-packaging-incompatibility.type';
import type { CuttingPackagingIncompatibilityRepository } from '../ports/cutting-packaging-incompatibility.repository.port';
import type { ProductPackaging } from '../product-packaging.type';
import { fakeIds } from './fake-ids.fake';

/** The cutting and packaging rules in memory; the same pair twice is CONFLICT. */
export class InMemoryCuttingPackagingIncompatibilities implements CuttingPackagingIncompatibilityRepository {
  private readonly newId = fakeIds('8002');
  rows: readonly CuttingPackagingIncompatibility[] = [];
  private clock = Date.UTC(2026, 10, 16, 9, 0, 0);

  create(
    cuttingStyleId: string,
    packaging: ProductPackaging,
  ): Promise<CuttingPackagingIncompatibility> {
    if (
      this.rows.some(
        (row) =>
          row.cuttingStyleId === cuttingStyleId && row.packaging === packaging,
      )
    ) {
      return Promise.reject(
        new AppError(ErrorCode.CONFLICT, {
          details: {
            constraint: 'cutting_packaging_incompatibilities_pair_key',
          },
        }),
      );
    }
    this.clock += 1_000;
    const row: CuttingPackagingIncompatibility = {
      id: this.newId(),
      cuttingStyleId,
      packaging,
      createdAt: new Date(this.clock),
    };
    this.rows = [...this.rows, row];
    return Promise.resolve(row);
  }

  list(page: PageRequest): Promise<Page<CuttingPackagingIncompatibility>> {
    return Promise.resolve(keysetPage(this.rows, page));
  }

  listAll(): Promise<CuttingPackagingIncompatibility[]> {
    return Promise.resolve(
      [...this.rows].sort(
        (a, b) =>
          a.createdAt.getTime() - b.createdAt.getTime() ||
          a.id.localeCompare(b.id),
      ),
    );
  }

  delete(id: string): Promise<boolean> {
    const before = this.rows.length;
    this.rows = this.rows.filter((row) => row.id !== id);
    return Promise.resolve(this.rows.length < before);
  }

  findForCuttingStyles(
    cuttingStyleIds: readonly string[],
  ): Promise<CuttingPackagingIncompatibility[]> {
    return Promise.resolve(
      this.rows.filter((row) => cuttingStyleIds.includes(row.cuttingStyleId)),
    );
  }
}
