import type { ProductStatus } from './product-status.type';

/** A vendor's or an admin's product list: optionally one vendor, one status. */
export type ProductListFilter = Readonly<{
  vendorId?: string;
  status?: ProductStatus;
}>;
