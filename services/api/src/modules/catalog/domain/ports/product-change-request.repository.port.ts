import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { ChangeRequestDecision } from '../change-request-decision.type';
import type { ProductChangeRequest } from '../product-change-request.type';
import type { ProductContent } from '../product-content.type';

/** Injection token of the ProductChangeRequestRepository. */
export const PRODUCT_CHANGE_REQUEST_REPOSITORY = Symbol(
  'PRODUCT_CHANGE_REQUEST_REPOSITORY',
);

/**
 * Where change requests on published products are kept. A request never changes after
 * it is created, except for its status: an admin decides exactly the content they saw.
 */
export interface ProductChangeRequestRepository {
  /**
   * Closes the product's pending request, if any, as `superseded`, and opens a new
   * pending one with this content and a new id. The caller holds the product's row lock
   * (ProductRepository.lockForWrite) in its transaction, so concurrent edits run one
   * after another; the partial unique index keeps one pending request per product.
   */
  openPending(
    productId: string,
    requestedById: string,
    content: ProductContent,
  ): Promise<ProductChangeRequest>;

  /** The product's most recent request, whatever its status; null for none. */
  findLatestOf(productId: string): Promise<ProductChangeRequest | null>;

  /** The request, whatever its status; null for an unknown id. */
  findById(id: string): Promise<ProductChangeRequest | null>;

  /** The pending requests, newest first: the admin review queue. */
  listPending(page: PageRequest): Promise<Page<ProductChangeRequest>>;

  /** Records the decision if the request is still pending (conditional); false otherwise. */
  decide(id: string, decision: ChangeRequestDecision): Promise<boolean>;
}
