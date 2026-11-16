import type { ProductWriteScope } from '../application/product-write-scope.type';

/** The scope of an admin's write on JAZLA's own products: any other vendor's is NOT_FOUND. */
export const PLATFORM_SCOPE: ProductWriteScope = { kind: 'platform' };
