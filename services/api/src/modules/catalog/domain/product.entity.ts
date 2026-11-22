import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { FieldError } from '@common/errors/field-error.type';
import type { ProductContent } from './product-content.type';
import type { ProductDetails } from './product-details.type';
import type { ProductPriceChanges } from './product-price-changes.type';
import type { ProductSubmissionProblem } from './product-submission-problem.type';
import type { SizeAvailabilityChange } from './size-availability-change.type';

/**
 * The rules on a product's content. Plain functions of the content: the use cases load
 * what they need (the live product) and ask.
 */
export class Product {
  /**
   * A product goes to review, is published, or takes a change request only with at
   * least one size and one image. Otherwise PRODUCT_NOT_SUBMITTABLE, every reason at
   * once. The cutting and packaging rules do not block it: they constrain what a
   * customer may choose (the line price, CRT-API-1), so a product may offer both sides of a forbidden
   * pair (DECISIONS.md, Catalog).
   */
  static assertSubmittable(content: ProductContent): void {
    const reasons: ProductSubmissionProblem[] = [];
    if (content.sizes.length === 0) {
      reasons.push('NO_SIZE');
    }
    if (content.imageMediaIds.length === 0) {
      reasons.push('NO_IMAGE');
    }
    if (reasons.length > 0) {
      throw new AppError(ErrorCode.PRODUCT_NOT_SUBMITTABLE, {
        details: { reasons },
      });
    }
  }

  /**
   * One request names each existing size, each cutting style and each packaging once. A
   * repeat would write one row twice (the last value winning) while the lowest price
   * counted both. Otherwise VALIDATION_FAILED on each repeat: `sizes.<i>.id`,
   * `cuttings.<i>.cuttingStyleId`, `packagings.<i>.packaging` (constraint
   * `isNotRepeated`). New sizes (id null) may repeat.
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
      ...Product.repeatsOf(
        content.packagings.map((option) => option.packaging),
        (index) => `packagings.${index}.packaging`,
      ),
    ]);
  }

  /**
   * A prices edit names each size, each cutting style and each packaging once. Otherwise
   * VALIDATION_FAILED on each repeat: `sizes.<i>.sizeId`, `cuttings.<i>.cuttingStyleId`,
   * `packagings.<i>.packaging` (constraint `isNotRepeated`).
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
      ...Product.repeatsOf(
        changes.packagings.map((change) => change.packaging),
        (index) => `packagings.${index}.packaging`,
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
   * existing size, cutting style or packaging in a content edit, whatever the status, must
   * keep its live price (the repository keeps the stored one anyway); a new one takes any
   * price. Otherwise VALIDATION_FAILED on `sizes.<i>.priceHalalas`,
   * `cuttings.<i>.extraPriceHalalas` or `packagings.<i>.extraPriceHalalas` (constraint
   * `isLivePrice`).
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
    const packagingPrices = new Map(
      live.packagings.map((option) => [option.packaging, option.extraPrice]),
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
      ...content.packagings.flatMap((option, index) => {
        const livePrice = packagingPrices.get(option.packaging);
        return livePrice === undefined || livePrice.equals(option.extraPrice)
          ? []
          : [
              {
                field: `packagings.${index}.extraPriceHalalas`,
                constraints: ['isLivePrice'],
              },
            ];
      }),
    ];
    if (details.length > 0) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, { details });
    }
  }

  /**
   * An availability edit names each size once, and only sizes of this product.
   * Otherwise VALIDATION_FAILED on `sizes.<i>.sizeId` (`isSizeOfProduct`,
   * `isNotRepeated`).
   */
  static assertSizeAvailabilityChanges(
    changes: readonly SizeAvailabilityChange[],
    live: ProductDetails,
  ): void {
    const ids = new Set(live.sizes.map((size) => size.id));
    Product.throwRepeats([
      ...changes.flatMap((change, index) =>
        ids.has(change.sizeId)
          ? []
          : [
              {
                field: `sizes.${index}.sizeId`,
                constraints: ['isSizeOfProduct'],
              },
            ],
      ),
      ...Product.repeatsOf(
        changes.map((change) => change.sizeId),
        (index) => `sizes.${index}.sizeId`,
      ),
    ]);
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
      packagings: live.packagings.map((option) => ({
        packaging: option.packaging,
        extraPrice: option.extraPrice,
      })),
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
