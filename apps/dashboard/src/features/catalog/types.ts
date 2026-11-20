import type { Schemas } from '@/api/client';

// The API's own shapes (services/api/openapi.json → src/api/schema.d.ts), docs/frontend/catalog.md.
export const LISTS = ['categories', 'meat-types', 'cutting-styles', 'exclusion-items'] as const;
export type ListName = (typeof LISTS)[number];
export type RefItem = Schemas['ReferenceItemResponseDto'];
export type CreateItem = Schemas['CreateReferenceItemDto'];
export type UpdateItem = Schemas['UpdateReferenceItemDto'];
export type Rule = Schemas['CuttingPackagingIncompatibilityResponseDto'];
export type CreateRule = Schemas['CreateCuttingPackagingIncompatibilityDto'];
export type ProductCard = Schemas['ProductCardResponseDto'];
export type Product = Schemas['ProductResponseDto'];
export type ProductContent = Schemas['ProductContentDto'];
export type CreateProduct = Schemas['CreateProductDto'];
export type Prices = Schemas['ChangeProductPricesDto'];
export type Fulfilment = Product['fulfilment'];
export type ProductStatus = Product['status'];
export type Packaging = Schemas['ProductPackagingDto']['packaging'];
export type UploadTicket = Schemas['UploadTicketResponseDto'];
export type MediaFile = Schemas['MediaFileResponseDto'];
export type Page<T> = { items: T[]; nextCursor: string | null };

/** Categories in their public order (`sortOrder`, lower first), the older first on a tie. */
export const bySortOrder = (a: RefItem, b: RefItem) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.createdAt.localeCompare(b.createdAt);

/** The API's packagings, in the order the form lists them. */
export const PACKAGINGS: Packaging[] = ['vacuum', 'trays', 'bags', 'none'];
export const PRODUCT_STATUSES: ProductStatus[] = ['draft', 'pending_review', 'published', 'rejected'];
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
/** catalog.product-image 5 MiB, catalog.category-image 2 MiB (POST /v1/admin/media/uploads). */
export const PRODUCT_IMAGE_MAX = 5 * 1024 * 1024;
export const CATEGORY_IMAGE_MAX = 2 * 1024 * 1024;
export const MAX_IMAGES = 10;

export type ProductQuery = { status?: ProductStatus; vendorId?: string; cursor?: string; limit?: number };
export type ListQuery = { cursor?: string; limit?: number; isActive?: 'true' | 'false' };
