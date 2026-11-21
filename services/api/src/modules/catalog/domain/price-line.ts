import { Money } from '@common/money/money';
import type { LineSelection } from './line-selection.type';
import type { PriceComponent } from './price-component.type';
import type { PriceLineError } from './price-line-error.type';
import type { PriceableProduct } from './priceable-product.type';
import type { PricedLine } from './priced-line.type';

/**
 * The one price of a product line (FR-PRD-02 to 05, 07): unit = size price + the chosen
 * cutting style's extra + the chosen packaging's extra, VAT included; line = unit ×
 * quantity; "without" items are free. Pure: the caller loads the product and its rules.
 *
 * Errors, each once, in this order: PRODUCT_UNAVAILABLE; OPTION_NOT_IN_PRODUCT for a
 * size, cutting style, packaging or "without" item the product does not offer;
 * SIZE_UNAVAILABLE; INCOMPATIBLE_CUTTING_PACKAGING; and, only when nothing else is
 * wrong, OPTION_REQUIRED for a product with cutting styles and none chosen. Any error
 * but OPTION_REQUIRED zeroes the line. The apps' price function follows the same
 * cases, proven by the shared fixture docs/frontend/fixtures/pricing-cases.json.
 */
export function priceLine(
  product: PriceableProduct,
  selection: LineSelection,
): PricedLine {
  const errors = new Set<PriceLineError>();
  if (!product.isAvailable) {
    errors.add('PRODUCT_UNAVAILABLE');
  }
  const size = product.sizes.find((option) => option.id === selection.sizeId);
  if (size === undefined) {
    errors.add('OPTION_NOT_IN_PRODUCT');
  } else if (!size.isAvailable) {
    errors.add('SIZE_UNAVAILABLE');
  }
  const cutting =
    selection.cuttingStyleId === null
      ? null
      : product.cuttings.find(
          (option) => option.cuttingStyleId === selection.cuttingStyleId,
        );
  const packaging =
    selection.packaging === null
      ? null
      : product.packagings.find(
          (option) => option.packaging === selection.packaging,
        );
  const exclusionIds = new Set(product.exclusions.map((item) => item.id));
  if (
    cutting === undefined ||
    packaging === undefined ||
    selection.exclusionItemIds.some((id) => !exclusionIds.has(id))
  ) {
    errors.add('OPTION_NOT_IN_PRODUCT');
  }
  if (
    product.incompatiblePairs.some(
      (pair) =>
        pair.cuttingStyleId === selection.cuttingStyleId &&
        pair.packaging === selection.packaging,
    )
  ) {
    errors.add('INCOMPATIBLE_CUTTING_PACKAGING');
  }
  if (
    errors.size === 0 &&
    product.cuttings.length > 0 &&
    selection.cuttingStyleId === null
  ) {
    errors.add('OPTION_REQUIRED');
  }
  if (size === undefined || [...errors].some((e) => e !== 'OPTION_REQUIRED')) {
    return {
      unitPrice: Money.zero(),
      lineTotal: Money.zero(),
      breakdown: [],
      errors: [...errors],
    };
  }

  const breakdown: PriceComponent[] = [
    { kind: 'size', optionId: size.id, amount: size.price },
    ...(cutting
      ? [
          {
            kind: 'cutting' as const,
            optionId: cutting.cuttingStyleId,
            amount: cutting.extraPrice,
          },
        ]
      : []),
    ...(packaging
      ? [
          {
            kind: 'packaging' as const,
            optionId: packaging.packaging,
            amount: packaging.extraPrice,
          },
        ]
      : []),
  ];
  const unitPrice = Money.sum(breakdown.map((part) => part.amount));
  return {
    unitPrice,
    lineTotal: unitPrice.multiply(selection.quantity),
    breakdown,
    errors: [...errors],
  };
}
