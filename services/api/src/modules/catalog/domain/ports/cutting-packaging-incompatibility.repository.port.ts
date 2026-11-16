import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { CuttingPackagingIncompatibility } from '../cutting-packaging-incompatibility.type';
import type { ProductPackaging } from '../product-packaging.type';

/** Injection token of the CuttingPackagingIncompatibilityRepository. */
export const CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY = Symbol(
  'CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY',
);

/** Where the global cutting and packaging rules are kept. */
export interface CuttingPackagingIncompatibilityRepository {
  /** Adds a rule; the same pair twice is CONFLICT. */
  create(
    cuttingStyleId: string,
    packaging: ProductPackaging,
  ): Promise<CuttingPackagingIncompatibility>;

  /** Newest first. */
  list(page: PageRequest): Promise<Page<CuttingPackagingIncompatibility>>;

  /** Removes a rule; false when none has this id. */
  delete(id: string): Promise<boolean>;

  /** The rules on any of these cutting styles. */
  findForCuttingStyles(
    cuttingStyleIds: readonly string[],
  ): Promise<CuttingPackagingIncompatibility[]>;
}
