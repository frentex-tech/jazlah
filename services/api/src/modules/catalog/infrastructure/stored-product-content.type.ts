import type { z } from 'zod';
import type { STORED_PRODUCT_CONTENT } from './stored-product-content.schema';

/** ProductContent as JSON: amounts as whole halalas. */
export type StoredProductContent = z.infer<typeof STORED_PRODUCT_CONTENT>;
