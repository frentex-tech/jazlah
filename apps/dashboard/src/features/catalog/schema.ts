import { z } from 'zod';
import { LISTS, PACKAGINGS, PRODUCT_STATUSES } from './types';

// The API's rules (CreateReferenceItemDto, ProductContentDto, …), checked at our route before the call; the API checks
// them again, with the reference rules (active entries, live prices) only it can check.
const uuid = z.string().uuid();
const name = z.object({ ar: z.string().trim().min(2).max(100), en: z.string().trim().min(2).max(100) });
const halalas = (min: number) => z.number().int().min(min).max(100_000_000);
const unique = <T>(key: (x: T) => unknown, field: string) => (xs: T[], ctx: z.RefinementCtx) => {
  const seen = new Set();
  xs.forEach((x, i) => {
    if (seen.has(key(x))) ctx.addIssue({ code: 'custom', path: [i, field].filter((p) => p !== '') as (string | number)[], message: 'isNotRepeated' });
    seen.add(key(x));
  });
};

export const ListSchema = z.enum(LISTS);
export const IdSchema = uuid;
export const ListQuerySchema = z.object({ cursor: z.string().min(1).optional(), limit: z.coerce.number().int().min(1).max(50).optional(), isActive: z.enum(['true', 'false']).optional() });
export const CreateItemSchema = z.object({ name, sortOrder: z.number().int().min(0).max(100_000).optional(), imageMediaId: uuid.nullable().optional() });
export const UpdateItemSchema = z.object({ name: name.optional(), isActive: z.boolean().optional(), sortOrder: z.number().int().min(0).max(100_000).optional(), imageMediaId: uuid.nullable().optional() });
export const CreateRuleSchema = z.object({ cuttingStyleId: uuid, packaging: z.enum(PACKAGINGS as [string, ...string[]]) });
export const ProductQuerySchema = z.object({
  status: z.enum(PRODUCT_STATUSES as [string, ...string[]]).optional(),
  vendorId: uuid.optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

const description = z.object({ ar: z.string().trim().max(1000).nullable().optional(), en: z.string().trim().max(1000).nullable().optional() });
export const ContentSchema = z.object({
  name,
  description: description.optional(),
  categoryId: uuid,
  meatTypeId: uuid.nullable().optional(),
  imageMediaIds: z.array(uuid).max(10).superRefine(unique((x) => x, '')),
  sizes: z
    .array(z.object({ id: uuid.nullable().optional(), approxWeightGrams: z.number().int().min(1).max(10_000_000), priceHalalas: halalas(1), tag: name.nullable().optional() }))
    .max(20)
    .superRefine(unique<{ id?: string | null }>((s) => s.id ?? Symbol(), 'id')),
  cuttings: z.array(z.object({ cuttingStyleId: uuid, extraPriceHalalas: halalas(0) })).max(30).superRefine(unique<{ cuttingStyleId: string }>((c) => c.cuttingStyleId, 'cuttingStyleId')),
  packagings: z
    .array(z.object({ packaging: z.enum(PACKAGINGS as [string, ...string[]]), extraPriceHalalas: halalas(0) }))
    .max(4)
    .superRefine(unique<{ packaging: string }>((p) => p.packaging, 'packaging')),
  exclusionItemIds: z.array(uuid).max(30).superRefine(unique((x) => x, '')),
});
const fulfilment = z.enum(['delivery', 'pickup', 'both']);
export const CreateProductSchema = ContentSchema.extend({ fulfilment });
export const AvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  sizes: z.array(z.object({ sizeId: uuid, isAvailable: z.boolean() })).max(20).superRefine(unique<{ sizeId: string }>((s) => s.sizeId, 'sizeId')).optional(),
});
export const FulfilmentSchema = z.object({ fulfilment });
export const PricesSchema = z.object({
  sizes: z.array(z.object({ sizeId: uuid, priceHalalas: halalas(1) })).max(20).optional(),
  cuttings: z.array(z.object({ cuttingStyleId: uuid, extraPriceHalalas: halalas(0) })).max(30).optional(),
  packagings: z.array(z.object({ packaging: z.enum(PACKAGINGS as [string, ...string[]]), extraPriceHalalas: halalas(0) })).max(4).optional(),
});
export const ReasonSchema = z.object({ reason: z.string().trim().min(1).max(500) });
export const ReviewQuerySchema = z.object({
  kind: z.enum(['product', 'change_request']).optional(),
  vendorId: uuid.optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
export const VendorListSchema = z.enum(['meat-types', 'cutting-styles', 'exclusion-items']);
export const UploadSchema = z.object({
  purpose: z.enum(['catalog.product-image', 'catalog.category-image']),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  fileName: z.string().max(255).optional(),
});

/** The query string as an object, empty values left out. */
export const queryOf = (url: URL) => Object.fromEntries([...url.searchParams].filter(([, v]) => v !== ''));
