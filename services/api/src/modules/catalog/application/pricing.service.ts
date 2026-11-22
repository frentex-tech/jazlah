import { Inject, Injectable } from '@nestjs/common';
import { Money } from '@common/money/money';
import type { LineSelection } from '../domain/line-selection.type';
import {
  CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY,
  type CuttingPackagingIncompatibilityRepository,
} from '../domain/ports/cutting-packaging-incompatibility.repository.port';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../domain/ports/product.repository.port';
import { priceLine } from '../domain/price-line';
import type { PricedLine } from '../domain/priced-line.type';

/**
 * The authoritative price of a product line, for other modules (the cart, checkout,
 * occasions): loads the product as the public sees it, with the cutting and packaging
 * rules on its cutting styles, and prices it with `priceLine`. A product the public
 * cannot see any more (unpublished, vendor suspended, category off, deleted) prices as
 * PRODUCT_UNAVAILABLE, zero. Reads only; never throws for a line that cannot be bought.
 */
@Injectable()
export class PricingService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY)
    private readonly rules: CuttingPackagingIncompatibilityRepository,
  ) {}

  async priceLine(
    input: Readonly<{ productId: string }> & LineSelection,
  ): Promise<PricedLine> {
    const product = await this.products.findPublic(input.productId);
    if (product === null) {
      return {
        unitPrice: Money.zero(),
        lineTotal: Money.zero(),
        breakdown: [],
        errors: ['PRODUCT_UNAVAILABLE'],
      };
    }
    const incompatiblePairs = await this.rules.findForCuttingStyles(
      product.cuttings.map((cutting) => cutting.cuttingStyleId),
    );
    return priceLine({ ...product, incompatiblePairs }, input);
  }
}
