import { z } from 'zod';

const localized = z.object({ ar: z.string(), en: z.string() });
const named = z.object({ id: z.string(), name: localized });

/**
 * A line's display as stored in `cart_items.display` (JSONB): `LineDisplay`. Read back
 * through this schema (R21): a row that does not match is a bug, INTERNAL_ERROR.
 */
export const LINE_DISPLAY_SCHEMA = z.object({
  vendorName: localized.nullable(),
  name: localized,
  size: z.object({
    id: z.string(),
    approxWeightGrams: z.number().int().positive(),
    tag: localized.nullable(),
  }),
  cutting: named.nullable(),
  exclusions: z.array(named),
});
