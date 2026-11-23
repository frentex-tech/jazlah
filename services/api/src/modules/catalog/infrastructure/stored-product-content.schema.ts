import { z } from 'zod';
import { PRODUCT_PACKAGINGS } from '../domain/product-packagings.constants';

const localized = z.object({ ar: z.string(), en: z.string() });
const halalas = z.number().int().nonnegative();

/**
 * A packaging with its extra price. Requests stored before packagings had prices
 * (issue #243) hold the bare name (`"trays"`): read as price 0. A request never changes
 * after it is created, so those rows are read this way, never rewritten.
 */
const packaging = z.union([
  z.object({
    packaging: z.enum(PRODUCT_PACKAGINGS),
    extraPriceHalalas: halalas,
  }),
  z
    .enum(PRODUCT_PACKAGINGS)
    .transform((name) => ({ packaging: name, extraPriceHalalas: 0 })),
]);

/**
 * A change request's content as stored in `product_change_requests.content` (JSONB):
 * ProductContent with amounts as whole halalas. Read back through this schema (R21):
 * a row that does not match is a bug, reported as INTERNAL_ERROR.
 */
export const STORED_PRODUCT_CONTENT = z.object({
  name: localized,
  description: z.object({
    ar: z.string().nullable(),
    en: z.string().nullable(),
  }),
  categoryId: z.string(),
  meatTypeId: z.string().nullable(),
  imageMediaIds: z.array(z.string()),
  sizes: z.array(
    z.object({
      id: z.string().nullable(),
      approxWeightGrams: z.number().int().positive(),
      priceHalalas: halalas,
      tag: localized.nullable(),
    }),
  ),
  cuttings: z.array(
    z.object({ cuttingStyleId: z.string(), extraPriceHalalas: halalas }),
  ),
  packagings: z.array(packaging),
  exclusionItemIds: z.array(z.string()),
});
