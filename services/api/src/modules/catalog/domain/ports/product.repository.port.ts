import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { NewProduct } from '../new-product.type';
import type { ProductContent } from '../product-content.type';
import type { ProductDetails } from '../product-details.type';
import type { ProductFulfilment } from '../product-fulfilment.type';
import type { ProductListFilter } from '../product-list-filter.type';
import type { ProductPriceChanges } from '../product-price-changes.type';
import type { ProductStatus } from '../product-status.type';
import type { ProductSummary } from '../product-summary.type';
import type { ProductTransition } from '../product-transition.type';
import type { PublicProductFilter } from '../public-product-filter.type';

/** Injection token of the ProductRepository. */
export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

/**
 * Where products and their options are kept. A vendor-side caller passes the vendor id
 * from the access token, never one from the request: another vendor's product is simply
 * not found. Writes touching several tables run inside the caller's transaction.
 */
export interface ProductRepository {
  /**
   * Creates a draft with its content, and its lowest price from the stored sizes, in the
   * caller's transaction.
   */
  create(product: NewProduct): Promise<ProductDetails>;

  /** The product, of this vendor only, or of any vendor when `vendorId` is null. */
  findDetails(
    id: string,
    vendorId: string | null,
  ): Promise<ProductDetails | null>;

  /** Newest first. */
  list(
    filter: ProductListFilter,
    page: PageRequest,
  ): Promise<Page<ProductSummary>>;

  /**
   * Replaces the content, in the caller's transaction: names, category, images,
   * packagings and exclusions as given; sizes matched by id (kept, added, the others
   * deleted) and cuttings by cutting style. **A kept size or cutting keeps its stored
   * price** (the content's is ignored): prices change only at creation and through
   * setPrices. Then the lowest price is worked out again from the stored sizes.
   */
  saveContent(id: string, content: ProductContent): Promise<ProductDetails>;

  /** Moves the product if it is still `from` (conditional update); false otherwise. */
  transition(
    id: string,
    from: ProductStatus,
    transition: ProductTransition,
  ): Promise<boolean>;

  setAvailability(id: string, isAvailable: boolean): Promise<void>;

  setFulfilment(id: string, fulfilment: ProductFulfilment): Promise<void>;

  /**
   * Sets the given prices, then the lowest price worked out again from the stored
   * sizes, in the caller's transaction.
   */
  setPrices(id: string, changes: ProductPriceChanges): Promise<void>;

  /**
   * The public list (FR-CAT-03): published, available products of active vendors in
   * active categories, newest first, in one query served by an index (status and
   * availability as index conditions).
   */
  listPublic(
    filter: PublicProductFilter,
    page: PageRequest,
  ): Promise<Page<ProductSummary>>;

  /** The product if the public may see it (as listPublic); null otherwise. */
  findPublic(id: string): Promise<ProductDetails | null>;
}
