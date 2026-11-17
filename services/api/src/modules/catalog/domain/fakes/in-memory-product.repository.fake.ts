import { searchTextOf } from './search-text.fake';
import { Money } from '@common/money/money';
import { keysetPage } from '@common/pagination/keyset-page.fake';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { NewProduct } from '../new-product.type';
import type { ProductRepository } from '../ports/product.repository.port';
import type { ProductContent } from '../product-content.type';
import type { ProductDetails } from '../product-details.type';
import type { ProductFulfilment } from '../product-fulfilment.type';
import type { ProductListFilter } from '../product-list-filter.type';
import type { ProductPriceChanges } from '../product-price-changes.type';
import type { ProductSize } from '../product-size.type';
import type { ProductStatus } from '../product-status.type';
import type { ProductSummary } from '../product-summary.type';
import type { ProductTransition } from '../product-transition.type';
import type { PublicProductFilter } from '../public-product-filter.type';
import type { InMemoryProductLocks } from './in-memory-product-locks.fake';
import type { InMemoryReferenceLists } from './in-memory-reference-lists.fake';
import { fakeIds } from './fake-ids.fake';

/** A product as the fake keeps it: its row fields and its live content, sizes with ids. */
type StoredProduct = Readonly<{
  id: string;
  vendorId: string;
  status: ProductStatus;
  isAvailable: boolean;
  fulfilment: ProductFulfilment;
  content: ProductContent;
  sizes: readonly ProductSize[];
  minPrice: Money | null;
  rejectionReason: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>;

/**
 * Products in memory, with names joined from the reference lists fake. `rows` is
 * replaced on every write (fake rollback). `suspendedVendors` stands for the vendors
 * whose status the public queries exclude. As the Prisma repository: a kept size or
 * cutting keeps its stored price, and the lowest price comes from the stored sizes.
 * Every write but `create` needs the product's lock (InMemoryProductLocks).
 */
export class InMemoryProductRepository implements ProductRepository {
  private readonly newId = fakeIds('8004');
  rows: readonly StoredProduct[] = [];
  readonly suspendedVendors = new Set<string>();
  private clock = Date.UTC(2026, 10, 16, 9, 0, 0);

  constructor(
    private readonly lists: InMemoryReferenceLists,
    private readonly locks: InMemoryProductLocks,
  ) {}

  lockForWrite(id: string, vendorId: string | null): Promise<boolean> {
    const found = this.rows.some(
      (row) =>
        row.id === id && (vendorId === null || row.vendorId === vendorId),
    );
    if (found) {
      this.locks.lock(id);
    }
    return Promise.resolve(found);
  }

  create(product: NewProduct): Promise<ProductDetails> {
    const now = this.nextDate();
    const sizes = this.sizesOf(product.content, []);
    const stored: StoredProduct = {
      id: this.newId(),
      vendorId: product.vendorId,
      status: 'draft',
      isAvailable: true,
      fulfilment: product.fulfilment,
      content: product.content,
      sizes,
      minPrice: this.minPriceOf(sizes),
      rejectionReason: null,
      submittedAt: null,
      reviewedAt: null,
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.rows = [...this.rows, stored];
    return Promise.resolve(this.detailsOf(stored));
  }

  findDetails(
    id: string,
    vendorId: string | null,
  ): Promise<ProductDetails | null> {
    this.locks.noteRead(id);
    const stored = this.rows.find(
      (row) =>
        row.id === id && (vendorId === null || row.vendorId === vendorId),
    );
    return Promise.resolve(
      stored === undefined ? null : this.detailsOf(stored),
    );
  }

  list(
    filter: ProductListFilter,
    page: PageRequest,
  ): Promise<Page<ProductSummary>> {
    return Promise.resolve(
      keysetPage(
        this.rows
          .filter(
            (row) =>
              (filter.vendorId === undefined ||
                row.vendorId === filter.vendorId) &&
              (filter.status === undefined || row.status === filter.status),
          )
          .map((row) => this.summaryOf(row)),
        page,
      ),
    );
  }

  saveContent(id: string, content: ProductContent): Promise<ProductDetails> {
    this.locks.assertLocked(id);
    const stored = this.get(id);
    const sizes = this.sizesOf(content, stored.sizes);
    const saved: StoredProduct = {
      ...stored,
      content: {
        ...content,
        sizes: content.sizes.map((size, index) => ({
          ...size,
          price: sizes[index]?.price ?? size.price,
        })),
        cuttings: content.cuttings.map((cutting) => ({
          ...cutting,
          extraPrice:
            stored.content.cuttings.find(
              (old) => old.cuttingStyleId === cutting.cuttingStyleId,
            )?.extraPrice ?? cutting.extraPrice,
        })),
        packagings: content.packagings.map((option) => ({
          ...option,
          extraPrice:
            stored.content.packagings.find(
              (old) => old.packaging === option.packaging,
            )?.extraPrice ?? option.extraPrice,
        })),
      },
      sizes,
      minPrice: this.minPriceOf(sizes),
      updatedAt: this.nextDate(),
    };
    this.replace(saved);
    return Promise.resolve(this.detailsOf(saved));
  }

  transition(
    id: string,
    from: ProductStatus,
    transition: ProductTransition,
  ): Promise<boolean> {
    this.locks.assertLocked(id);
    const stored = this.rows.find((row) => row.id === id);
    if (stored === undefined || stored.status !== from) {
      return Promise.resolve(false);
    }
    const now = this.nextDate();
    this.replace({
      ...stored,
      status: transition.to,
      rejectionReason: transition.rejectionReason,
      submittedAt:
        transition.to === 'pending_review' ? now : stored.submittedAt,
      publishedAt: transition.to === 'published' ? now : stored.publishedAt,
      reviewedAt: transition.reviewerId === null ? stored.reviewedAt : now,
      updatedAt: now,
    });
    return Promise.resolve(true);
  }

  setAvailability(id: string, isAvailable: boolean): Promise<void> {
    this.locks.assertLocked(id);
    this.replace({ ...this.get(id), isAvailable, updatedAt: this.nextDate() });
    return Promise.resolve();
  }

  setFulfilment(id: string, fulfilment: ProductFulfilment): Promise<void> {
    this.locks.assertLocked(id);
    this.replace({ ...this.get(id), fulfilment, updatedAt: this.nextDate() });
    return Promise.resolve();
  }

  setPrices(id: string, changes: ProductPriceChanges): Promise<ProductDetails> {
    this.locks.assertLocked(id);
    const stored = this.get(id);
    const sizes = stored.sizes.map((size) => ({
      ...size,
      price:
        changes.sizes.find((change) => change.sizeId === size.id)?.price ??
        size.price,
    }));
    const content: ProductContent = {
      ...stored.content,
      sizes: stored.content.sizes.map((size, index) => ({
        ...size,
        price: sizes[index]?.price ?? size.price,
      })),
      cuttings: stored.content.cuttings.map((cutting) => ({
        ...cutting,
        extraPrice:
          changes.cuttings.find(
            (change) => change.cuttingStyleId === cutting.cuttingStyleId,
          )?.extraPrice ?? cutting.extraPrice,
      })),
      packagings: stored.content.packagings.map((option) => ({
        ...option,
        extraPrice:
          changes.packagings.find(
            (change) => change.packaging === option.packaging,
          )?.extraPrice ?? option.extraPrice,
      })),
    };
    const saved: StoredProduct = {
      ...stored,
      sizes,
      content,
      minPrice: this.minPriceOf(sizes),
      updatedAt: this.nextDate(),
    };
    this.replace(saved);
    return Promise.resolve(this.detailsOf(saved));
  }

  listPublic(
    filter: PublicProductFilter,
    page: PageRequest,
  ): Promise<Page<ProductSummary>> {
    return Promise.resolve(
      keysetPage(
        this.rows
          .filter(
            (row) =>
              this.isPublic(row) &&
              (filter.text === undefined ||
                (searchTextOf(filter.text) !== '' &&
                  searchTextOf(
                    `${row.content.name.ar} ${row.content.name.en}`,
                  ).includes(searchTextOf(filter.text)))) &&
              (filter.categoryId === undefined ||
                row.content.categoryId === filter.categoryId) &&
              (filter.vendorId === undefined ||
                row.vendorId === filter.vendorId) &&
              (filter.meatTypeId === undefined ||
                row.content.meatTypeId === filter.meatTypeId) &&
              (filter.minPrice === undefined ||
                (row.minPrice !== null &&
                  !row.minPrice.isLessThan(filter.minPrice))) &&
              (filter.maxPrice === undefined ||
                (row.minPrice !== null &&
                  !row.minPrice.isGreaterThan(filter.maxPrice))),
          )
          .map((row) => this.summaryOf(row)),
        page,
      ),
    );
  }

  findPublic(id: string): Promise<ProductDetails | null> {
    const stored = this.rows.find((row) => row.id === id && this.isPublic(row));
    return Promise.resolve(
      stored === undefined ? null : this.detailsOf(stored),
    );
  }

  private isPublic(row: StoredProduct): boolean {
    return (
      row.status === 'published' &&
      row.isAvailable &&
      !this.suspendedVendors.has(row.vendorId) &&
      this.lists.find('categories', row.content.categoryId)?.isActive === true
    );
  }

  /**
   * The content's sizes with ids: an existing id kept with its stored price, a new one
   * otherwise.
   */
  private sizesOf(
    content: ProductContent,
    previous: readonly ProductSize[],
  ): ProductSize[] {
    return content.sizes.map((size) => {
      const old = previous.find((kept) => kept.id === size.id);
      return {
        id: old?.id ?? this.newId(),
        approxWeightGrams: size.approxWeightGrams,
        price: old?.price ?? size.price,
        tag: size.tag,
      };
    });
  }

  private detailsOf(row: StoredProduct): ProductDetails {
    const named = (
      list: 'categories' | 'meat_types' | 'cutting_styles' | 'exclusion_items',
      id: string,
    ) => ({
      id,
      name: this.lists.find(list, id)?.name ?? { ar: '?', en: '?' },
    });
    return {
      id: row.id,
      vendorId: row.vendorId,
      status: row.status,
      isAvailable: row.isAvailable,
      fulfilment: row.fulfilment,
      name: row.content.name,
      description: row.content.description,
      category: named('categories', row.content.categoryId),
      meatType:
        row.content.meatTypeId === null
          ? null
          : named('meat_types', row.content.meatTypeId),
      imageMediaIds: row.content.imageMediaIds,
      sizes: row.sizes,
      cuttings: row.content.cuttings.map((cutting) => ({
        cuttingStyleId: cutting.cuttingStyleId,
        name: named('cutting_styles', cutting.cuttingStyleId).name,
        extraPrice: cutting.extraPrice,
      })),
      packagings: row.content.packagings,
      exclusions: row.content.exclusionItemIds.map((id) =>
        named('exclusion_items', id),
      ),
      minPrice: row.minPrice,
      rejectionReason: row.rejectionReason,
      submittedAt: row.submittedAt,
      reviewedAt: row.reviewedAt,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private summaryOf(row: StoredProduct): ProductSummary {
    return {
      id: row.id,
      vendorId: row.vendorId,
      categoryId: row.content.categoryId,
      meatTypeId: row.content.meatTypeId,
      status: row.status,
      isAvailable: row.isAvailable,
      name: row.content.name,
      minPrice: row.minPrice,
      coverMediaId: row.content.imageMediaIds[0] ?? null,
      createdAt: row.createdAt,
    };
  }

  /** The lowest stored size price, null for none (the repository's aggregate). */
  private minPriceOf(sizes: readonly ProductSize[]): Money | null {
    return Money.min(sizes.map((size) => size.price));
  }

  private get(id: string): StoredProduct {
    const stored = this.rows.find((row) => row.id === id);
    if (stored === undefined) {
      throw new Error(`No product ${id} in the fake`);
    }
    return stored;
  }

  private replace(stored: StoredProduct): void {
    this.rows = this.rows.map((row) => (row.id === stored.id ? stored : row));
  }

  private nextDate(): Date {
    this.clock += 1_000;
    return new Date(this.clock);
  }
}
