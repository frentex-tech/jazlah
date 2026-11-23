import type { Page } from '@common/pagination/page.type';
import type { ProductChangeRequest } from '../domain/product-change-request.type';

/**
 * A page of change requests with the public URL of every image they propose, so a
 * reviewer sees what they approve.
 */
export type ProductChangeRequestPage = Readonly<{
  page: Page<ProductChangeRequest>;
  imageUrls: ReadonlyMap<string, string>;
}>;
