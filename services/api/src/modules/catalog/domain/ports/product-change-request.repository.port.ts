import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { ChangeRequestDecision } from '../change-request-decision.type';
import type { ProductChangeRequest } from '../product-change-request.type';
import type { ProductContent } from '../product-content.type';

/** Injection token of the ProductChangeRequestRepository. */
export const PRODUCT_CHANGE_REQUEST_REPOSITORY = Symbol(
  'PRODUCT_CHANGE_REQUEST_REPOSITORY',
);

/** Where change requests on published products are kept. */
export interface ProductChangeRequestRepository {
  /**
   * Stores the product's pending request: creates it, or replaces the content of the
   * one already pending, in one statement (safe beside a concurrent call).
   */
  savePending(
    productId: string,
    requestedById: string,
    content: ProductContent,
  ): Promise<ProductChangeRequest>;

  /** The product's most recent request, whatever its status; null for none. */
  findLatestOf(productId: string): Promise<ProductChangeRequest | null>;

  /** The request if it is pending; null otherwise. */
  findPending(id: string): Promise<ProductChangeRequest | null>;

  /** The pending requests, newest first: the admin review queue. */
  listPending(page: PageRequest): Promise<Page<ProductChangeRequest>>;

  /** Records the decision if the request is still pending (conditional); false otherwise. */
  decide(id: string, decision: ChangeRequestDecision): Promise<boolean>;
}
