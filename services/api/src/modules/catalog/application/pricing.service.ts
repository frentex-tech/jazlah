import { Inject, Injectable } from '@nestjs/common';
import { Money } from '@common/money/money';
import type { LineQuote } from '../domain/line-quote.type';
import type { LineQuoteRequest } from '../domain/line-quote-request.type';
import type { LineSelection } from '../domain/line-selection.type';
import {
  CATALOG_MEDIA,
  type CatalogMedia,
} from '../domain/ports/catalog-media.port';
import {
  CATALOG_VENDORS,
  type CatalogVendors,
} from '../domain/ports/catalog-vendors.port';
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
import type { ProductDetails } from '../domain/product-details.type';

const UNAVAILABLE: PricedLine = {
  unitPrice: Money.zero(),
  lineTotal: Money.zero(),
  breakdown: [],
  errors: ['PRODUCT_UNAVAILABLE'],
};

/**
 * The authoritative price of a product line, for other modules (the cart, checkout,
 * occasions): loads the product as the public sees it, with the cutting and packaging
 * rules on its cutting styles, and prices it with `priceLine`. A product the public
 * cannot see any more (unpublished, vendor suspended, category off, deleted) prices as
 * PRODUCT_UNAVAILABLE, zero. Reads only; never throws for a line that cannot be bought.
 *
 * `quoteLines` prices several lines at once (each product and the rules loaded once)
 * with what each line shows: names, first image, store, the chosen options' names.
 */
@Injectable()
export class PricingService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY)
    private readonly rules: CuttingPackagingIncompatibilityRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(CATALOG_VENDORS) private readonly vendors: CatalogVendors,
  ) {}

  async priceLine(
    input: Readonly<{ productId: string }> & LineSelection,
  ): Promise<PricedLine> {
    const product = await this.products.findPublic(input.productId);
    if (product === null) {
      return UNAVAILABLE;
    }
    const incompatiblePairs = await this.rules.findForCuttingStyles(
      product.cuttings.map((cutting) => cutting.cuttingStyleId),
    );
    return priceLine({ ...product, incompatiblePairs }, input);
  }

  /** Each line priced now and described, in the order given. */
  async quoteLines(lines: readonly LineQuoteRequest[]): Promise<LineQuote[]> {
    const ids = [...new Set(lines.map((line) => line.productId))];
    const found = await Promise.all(
      ids.map((id) => this.products.findPublic(id)),
    );
    const products = new Map(
      found
        .filter((product): product is ProductDetails => product !== null)
        .map((product) => [product.id, product]),
    );
    const live = [...products.values()];
    const [rules, imageUrls, vendorNames] = await Promise.all([
      this.rules.findForCuttingStyles([
        ...new Set(
          live.flatMap((product) =>
            product.cuttings.map((cutting) => cutting.cuttingStyleId),
          ),
        ),
      ]),
      this.media.publicUrls(
        live.flatMap((product) => product.imageMediaIds.slice(0, 1)),
      ),
      this.vendors.namesOf([...new Set(live.map((p) => p.vendorId))]),
    ]);
    return lines.map((line) => {
      const product = products.get(line.productId);
      if (product === undefined) {
        return { priced: UNAVAILABLE, product: null };
      }
      const offered = new Set(product.cuttings.map((c) => c.cuttingStyleId));
      const priced = priceLine(
        {
          ...product,
          incompatiblePairs: rules.filter((rule) =>
            offered.has(rule.cuttingStyleId),
          ),
        },
        line,
      );
      const size = product.sizes.find((option) => option.id === line.sizeId);
      const cutting = product.cuttings.find(
        (option) => option.cuttingStyleId === line.cuttingStyleId,
      );
      const firstImage = product.imageMediaIds[0];
      return {
        priced,
        product: {
          id: product.id,
          vendorId: product.vendorId,
          vendorName: vendorNames.get(product.vendorId) ?? null,
          name: product.name,
          imageUrl:
            firstImage === undefined
              ? null
              : (imageUrls.get(firstImage) ?? null),
          fulfilment: product.fulfilment,
          size:
            size === undefined
              ? null
              : {
                  id: size.id,
                  approxWeightGrams: size.approxWeightGrams,
                  tag: size.tag,
                },
          cutting:
            cutting === undefined
              ? null
              : { id: cutting.cuttingStyleId, name: cutting.name },
          exclusions: product.exclusions.filter((item) =>
            line.exclusionItemIds.includes(item.id),
          ),
        },
      };
    });
  }
}
