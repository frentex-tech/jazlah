import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { FieldError } from '@common/errors/field-error.type';
import type { CuttingPackagingIncompatibility } from './cutting-packaging-incompatibility.type';
import type { ProductContent } from './product-content.type';
import type { ProductDetails } from './product-details.type';
import type { ProductPriceChanges } from './product-price-changes.type';
import type { ProductSubmissionProblem } from './product-submission-problem.type';

/**
 * The rules on a product's content. Plain functions of the content: the use cases load
 * what they need (the live product, the incompatibilities) and ask.
 */
export class Product {
  /**
   * A product goes to review, is published, or takes a change request only with at
   * least one size and one image, and no offered cutting style with an offered
   * packaging it is incompatible with. Otherwise PRODUCT_NOT_SUBMITTABLE, every reason
   * at once, the incompatible pairs listed.
   */
  static assertSubmittable(
    content: ProductContent,
    incompatibilities: readonly Pick<
      CuttingPackagingIncompatibility,
      'cuttingStyleId' | 'packaging'
    >[],
  ): void {
    const reasons: ProductSubmissionProblem[] = [];
    if (content.sizes.length === 0) {
      reasons.push('NO_SIZE');
    }
    if (content.imageMediaIds.length === 0) {
      reasons.push('NO_IMAGE');
    }
    const offered = new Set(
      content.cuttings.map((cutting) => cutting.cuttingStyleId),
    );
    const pairs = incompatibilities
      .filter(
        (rule) =>
          offered.has(rule.cuttingStyleId) &&
          content.packagings.includes(rule.packaging),
      )
      .map((rule) => ({
        cuttingStyleId: rule.cuttingStyleId,
        packaging: rule.packaging,
      }));
    if (pairs.length > 0) {
      reasons.push('INCOMPATIBLE_CUTTING_PACKAGING');
    }
    if (reasons.length > 0) {
      throw new AppError(ErrorCode.PRODUCT_NOT_SUBMITTABLE, {
        details: pairs.length > 0 ? { reasons, pairs } : { reasons },
      });
    }
  }

  /**
   * One request names each existing size and each cutting style once. A repeat would
   * write one row twice (the last value winning) while the lowest price counted both.
   * Otherwise VALIDATION_FAILED on each repeat: `sizes.<i>.id`,
   * `cuttings.<i>.cuttingStyleId` (constraint `isNotRepeated`). New sizes (id null)
   * may repeat.
   */
  static assertNoRepeats(content: ProductContent): void {
    Product.throwRepeats([
      ...Product.repeatsOf(
        content.sizes.map((size) => size.id),
        (index) => `sizes.${index}.id`,
      ),
      ...Product.repeatsOf(
        content.cuttings.map((cutting) => cutting.cuttingStyleId),
        (index) => `cuttings.${index}.cuttingStyleId`,
      ),
    ]);
  }

  /**
   * A prices edit names each size and each cutting style once. Otherwise
   * VALIDATION_FAILED on each repeat: `sizes.<i>.sizeId`, `cuttings.<i>.cuttingStyleId`
   * (constraint `isNotRepeated`).
   */
  static assertNoRepeatedPriceChanges(changes: ProductPriceChanges): void {
    Product.throwRepeats([
      ...Product.repeatsOf(
        changes.sizes.map((change) => change.sizeId),
        (index) => `sizes.${index}.sizeId`,
      ),
      ...Product.repeatsOf(
        changes.cuttings.map((change) => change.cuttingStyleId),
        (index) => `cuttings.${index}.cuttingStyleId`,
      ),
    ]);
  }

  /**
   * Every size id in the content is a size of this product (`live`, null for a new
   * product, which has none). Otherwise VALIDATION_FAILED on `sizes.<i>.id`.
   */
  static assertOwnSizes(
    content: ProductContent,
    live: ProductDetails | null,
  ): void {
    const ids = new Set(live?.sizes.map((size) => size.id) ?? []);
    const details: FieldError[] = content.sizes.flatMap((size, index) =>
      size.id === null || ids.has(size.id)
        ? []
        : [{ field: `sizes.${index}.id`, constraints: ['isSizeOfProduct'] }],
    );
    if (details.length > 0) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, { details });
    }
  }

  /**
   * Prices change only at creation and through the prices edit (at once, audited): an
   * existing size or cutting style in a content edit, whatever the status, must keep its
   * live price (the repository keeps the stored one anyway). Otherwise
   * VALIDATION_FAILED on `sizes.<i>.priceHalalas` or `cuttings.<i>.extraPriceHalalas`
   * (constraint `isLivePrice`).
   */
  static assertKeepsLivePrices(
    content: ProductContent,
    live: ProductDetails,
  ): void {
    const sizePrices = new Map(live.sizes.map((size) => [size.id, size.price]));
    const cuttingPrices = new Map(
      live.cuttings.map((cutting) => [
        cutting.cuttingStyleId,
        cutting.extraPrice,
      ]),
    );
    const details: FieldError[] = [
      ...content.sizes.flatMap((size, index) => {
        const livePrice =
          size.id === null ? undefined : sizePrices.get(size.id);
        return livePrice === undefined || livePrice.equals(size.price)
          ? []
          : [
              {
                field: `sizes.${index}.priceHalalas`,
                constraints: ['isLivePrice'],
              },
            ];
      }),
      ...content.cuttings.flatMap((cutting, index) => {
        const livePrice = cuttingPrices.get(cutting.cuttingStyleId);
        return livePrice === undefined || livePrice.equals(cutting.extraPrice)
          ? []
          : [
              {
                field: `cuttings.${index}.extraPriceHalalas`,
                constraints: ['isLivePrice'],
              },
            ];
      }),
    ];
    if (details.length > 0) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, { details });
    }
  }

  /** The live product's content, as an edit would write it unchanged. */
  static contentOf(live: ProductDetails): ProductContent {
    return {
      name: live.name,
      description: live.description,
      categoryId: live.category.id,
      meatTypeId: live.meatType?.id ?? null,
      imageMediaIds: live.imageMediaIds,
      sizes: live.sizes.map((size) => ({
        id: size.id,
        approxWeightGrams: size.approxWeightGrams,
        price: size.price,
        tag: size.tag,
      })),
      cuttings: live.cuttings.map((cutting) => ({
        cuttingStyleId: cutting.cuttingStyleId,
        extraPrice: cutting.extraPrice,
      })),
      packagings: live.packagings,
      exclusionItemIds: live.exclusions.map((exclusion) => exclusion.id),
    };
  }

  /** A field error for every value (null aside) already seen earlier in `values`. */
  private static repeatsOf(
    values: readonly (string | null)[],
    field: (index: number) => string,
  ): FieldError[] {
    const seen = new Set<string>();
    return values.flatMap((value, index) => {
      if (value === null) {
        return [];
      }
      if (seen.has(value)) {
        return [{ field: field(index), constraints: ['isNotRepeated'] }];
      }
      seen.add(value);
      return [];
    });
  }

  private static throwRepeats(details: readonly FieldError[]): void {
    if (details.length > 0) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, { details });
    }
  }
}
