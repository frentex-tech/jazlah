import { Inject, Injectable } from '@nestjs/common';
import {
  CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY,
  type CuttingPackagingIncompatibilityRepository,
} from '../domain/ports/cutting-packaging-incompatibility.repository.port';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import type { NamedIncompatibility } from '../domain/named-incompatibility.type';

/**
 * The cutting and packaging pairs a vendor's product may not offer together, for the
 * product form: only the rules whose cutting style is active (an inactive one cannot be
 * chosen), each with the cutting style's name, oldest rule first. Whole, not paged.
 */
@Injectable()
export class ListVendorIncompatibilitiesUseCase {
  constructor(
    @Inject(CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY)
    private readonly rules: CuttingPackagingIncompatibilityRepository,
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
  ) {}

  async execute(): Promise<NamedIncompatibility[]> {
    const [rules, cuttingStyles] = await Promise.all([
      this.rules.listAll(),
      this.lists.listActive('cutting_styles'),
    ]);
    const names = new Map(cuttingStyles.map((item) => [item.id, item.name]));
    return rules.flatMap((rule) => {
      const name = names.get(rule.cuttingStyleId);
      return name === undefined
        ? []
        : [
            {
              cuttingStyle: { id: rule.cuttingStyleId, name },
              packaging: rule.packaging,
            },
          ];
    });
  }
}
