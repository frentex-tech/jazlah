import { z } from 'zod';

const localized = z.object({ ar: z.string(), en: z.string() });
const named = z.object({ id: z.string(), name: localized });
const point = z.object({ latitude: z.number(), longitude: z.number() });

/**
 * What the order tables keep as JSON (`orders.vendor_snapshot`, `address_snapshot`,
 * `pickup_snapshot`, `order_items.snapshot`). Read back through these schemas (R21): a
 * row that does not match is a bug, INTERNAL_ERROR.
 */
export const ORDER_VENDOR_SNAPSHOT_SCHEMA = z.object({
  name: localized,
  phone: z.string().nullable(),
  location: point.nullable(),
  city: z.string().nullable(),
});

export const ORDER_ADDRESS_SNAPSHOT_SCHEMA = z.object({
  label: z.string(),
  location: point,
  city: z.string().nullable(),
  district: z.string().nullable(),
  street: z.string().nullable(),
  building: z.string().nullable(),
  shortNationalAddress: z.string().nullable(),
  driverInstructions: z.string().nullable(),
});

export const ORDER_PICKUP_SNAPSHOT_SCHEMA = z.object({
  name: localized,
  address: localized.nullable(),
  location: point.nullable(),
  phone: z.string().nullable(),
  hours: z.object({ start: z.string(), end: z.string() }).nullable(),
});

export const ORDER_ITEM_NAMES_SCHEMA = z.object({
  name: localized,
  size: z.object({
    id: z.string(),
    approxWeightGrams: z.number().int().positive(),
    tag: localized.nullable(),
  }),
  cutting: named.nullable(),
  exclusions: z.array(named),
});
