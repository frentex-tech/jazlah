import { escapeLikePattern } from '@common/text/escape-like-pattern';
import { Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { toPage } from '@common/pagination/to-page';
import { DbContext } from '@infra/database/db-context';
import type { Prisma } from '@infra/database/generated/prisma/client';
import { keysetAfter } from '@infra/database/keyset-after';
import { KEYSET_ORDER } from '@infra/database/keyset-order.constants';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { NewProduct } from '../domain/new-product.type';
import type { ProductRepository } from '../domain/ports/product.repository.port';
import type { ProductContent } from '../domain/product-content.type';
import type { ProductDetails } from '../domain/product-details.type';
import type { ProductFulfilment } from '../domain/product-fulfilment.type';
import type { ProductListFilter } from '../domain/product-list-filter.type';
import type { ProductPriceChanges } from '../domain/product-price-changes.type';
import type { ProductStatus } from '../domain/product-status.type';
import type { ProductSummary } from '../domain/product-summary.type';
import type { ProductTransition } from '../domain/product-transition.type';
import type { PublicProductFilter } from '../domain/public-product-filter.type';
import { PRODUCT_DETAILS_INCLUDE } from './product-details-include.constants';
import { PRODUCT_SUMMARY_SELECT } from './product-summary-select.constants';
import { toProductDetails, toProductSummary } from './product.mapper';

/** A position far above any real one: sizes move there first when reordered. */
const REORDER_OFFSET = 1_000_000;

/**
 * Products and their options. Multi-table writes run in the caller's transaction (the
 * use cases open one). The public reads join the vendor's status read-only: the one
 * exception to "a module reads only its own tables" (DECISIONS.md, Catalog).
 */
@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly db: DbContext) {}

  async create(product: NewProduct): Promise<ProductDetails> {
    const { content } = product;
    try {
      const { id } = await this.db.client.product.create({
        data: {
          vendorId: product.vendorId,
          fulfilment: product.fulfilment,
          ...this.productFields(content),
          images: { create: this.imageRows(content) },
          sizes: {
            create: content.sizes.map((size, position) => ({
              ...this.sizeFields(size),
              priceHalalas: size.price.halalas,
              position,
            })),
          },
          cuttings: { create: this.cuttingRows(content) },
          packagings: {
            create: this.packagingRows(content),
          },
          exclusions: {
            create: content.exclusionItemIds.map((exclusionItemId) => ({
              exclusionItemId,
            })),
          },
        },
        select: { id: true },
      });
      return await this.refreshMinPrice(id);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async lockForWrite(id: string, vendorId: string | null): Promise<boolean> {
    const client = this.db.client;
    try {
      const rows =
        vendorId === null
          ? await client.$queryRaw<unknown[]>`
              SELECT 1 FROM "products" WHERE "id" = ${id}::uuid FOR UPDATE`
          : await client.$queryRaw<unknown[]>`
              SELECT 1 FROM "products"
              WHERE "id" = ${id}::uuid AND "vendor_id" = ${vendorId}::uuid
              FOR UPDATE`;
      return rows.length === 1;
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findDetails(
    id: string,
    vendorId: string | null,
  ): Promise<ProductDetails | null> {
    try {
      const row = await this.db.client.product.findFirst({
        where: vendorId === null ? { id } : { id, vendorId },
        include: PRODUCT_DETAILS_INCLUDE,
      });
      return row === null ? null : toProductDetails(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async list(
    filter: ProductListFilter,
    page: PageRequest,
  ): Promise<Page<ProductSummary>> {
    return this.summaries({ ...filter }, page);
  }

  async saveContent(
    id: string,
    content: ProductContent,
  ): Promise<ProductDetails> {
    const client = this.db.client;
    const keptIds = content.sizes.flatMap((size) =>
      size.id === null ? [] : [size.id],
    );
    try {
      await client.product.update({
        where: { id },
        data: this.productFields(content),
      });
      await client.productImage.deleteMany({ where: { productId: id } });
      await client.productImage.createMany({
        data: this.imageRows(content).map((row) => ({ ...row, productId: id })),
      });

      await client.productSize.deleteMany({
        where: { productId: id, id: { notIn: keptIds } },
      });
      // Kept sizes move out of the way first: positions are unique per product.
      for (const [index, sizeId] of keptIds.entries()) {
        await client.productSize.updateMany({
          where: { id: sizeId, productId: id },
          data: { position: REORDER_OFFSET + index },
        });
      }
      for (const [position, size] of content.sizes.entries()) {
        if (size.id === null) {
          await client.productSize.create({
            data: {
              ...this.sizeFields(size),
              priceHalalas: size.price.halalas,
              position,
              productId: id,
            },
          });
        } else {
          // A kept size keeps its stored price: prices change only through setPrices.
          await client.productSize.updateMany({
            where: { id: size.id, productId: id },
            data: { ...this.sizeFields(size), position },
          });
        }
      }

      const cuttingStyleIds = content.cuttings.map(
        (cutting) => cutting.cuttingStyleId,
      );
      await client.productCutting.deleteMany({
        where: { productId: id, cuttingStyleId: { notIn: cuttingStyleIds } },
      });
      // A kept cutting keeps its stored extra price (ON CONFLICT DO NOTHING on the pair).
      await client.productCutting.createMany({
        data: this.cuttingRows(content).map((row) => ({
          ...row,
          productId: id,
        })),
        skipDuplicates: true,
      });

      const packagings = content.packagings.map((option) => option.packaging);
      await client.productPackagingOption.deleteMany({
        where: { productId: id, packaging: { notIn: packagings } },
      });
      // A kept packaging keeps its stored extra price (ON CONFLICT DO NOTHING on the pair).
      await client.productPackagingOption.createMany({
        data: this.packagingRows(content).map((row) => ({
          ...row,
          productId: id,
        })),
        skipDuplicates: true,
      });
      await client.productExclusion.deleteMany({ where: { productId: id } });
      await client.productExclusion.createMany({
        data: content.exclusionItemIds.map((exclusionItemId) => ({
          productId: id,
          exclusionItemId,
        })),
      });

      return await this.refreshMinPrice(id);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async transition(
    id: string,
    from: ProductStatus,
    transition: ProductTransition,
  ): Promise<boolean> {
    const now = new Date();
    try {
      const { count } = await this.db.client.product.updateMany({
        where: { id, status: from },
        data: {
          status: transition.to,
          rejectionReason: transition.rejectionReason,
          ...(transition.to === 'pending_review' ? { submittedAt: now } : {}),
          ...(transition.to === 'published' ? { publishedAt: now } : {}),
          ...(transition.reviewerId === null
            ? {}
            : { reviewedAt: now, reviewedById: transition.reviewerId }),
        },
      });
      return count === 1;
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async setAvailability(id: string, isAvailable: boolean): Promise<void> {
    try {
      await this.db.client.product.updateMany({
        where: { id },
        data: { isAvailable },
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async setFulfilment(
    id: string,
    fulfilment: ProductFulfilment,
  ): Promise<void> {
    try {
      await this.db.client.product.updateMany({
        where: { id },
        data: { fulfilment },
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async setPrices(
    id: string,
    changes: ProductPriceChanges,
  ): Promise<ProductDetails> {
    const client = this.db.client;
    try {
      for (const change of changes.sizes) {
        await client.productSize.updateMany({
          where: { id: change.sizeId, productId: id },
          data: { priceHalalas: change.price.halalas },
        });
      }
      for (const change of changes.cuttings) {
        await client.productCutting.updateMany({
          where: { productId: id, cuttingStyleId: change.cuttingStyleId },
          data: { extraPriceHalalas: change.extraPrice.halalas },
        });
      }
      for (const change of changes.packagings) {
        await client.productPackagingOption.updateMany({
          where: { productId: id, packaging: change.packaging },
          data: { extraPriceHalalas: change.extraPrice.halalas },
        });
      }
      return await this.refreshMinPrice(id);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async listPublic(
    filter: PublicProductFilter,
    page: PageRequest,
  ): Promise<Page<ProductSummary>> {
    const price =
      filter.minPrice === undefined && filter.maxPrice === undefined
        ? {}
        : {
            minPriceHalalas: {
              ...(filter.minPrice === undefined
                ? {}
                : { gte: filter.minPrice.halalas }),
              ...(filter.maxPrice === undefined
                ? {}
                : { lte: filter.maxPrice.halalas }),
            },
          };
    const pattern =
      filter.text === undefined
        ? undefined
        : await this.searchPattern(filter.text);
    // A query of only diacritics or tatweel normalises to nothing: it names no product,
    // so the answer is an empty page, never every product (`LIKE '%%'`).
    if (pattern === '') {
      return { items: [], nextCursor: null };
    }
    const search =
      pattern === undefined ? {} : { searchText: { contains: pattern } };
    return this.summaries(
      {
        ...this.publicWhere(),
        ...search,
        ...(filter.categoryId === undefined
          ? {}
          : { categoryId: filter.categoryId }),
        ...(filter.vendorId === undefined ? {} : { vendorId: filter.vendorId }),
        ...(filter.meatTypeId === undefined
          ? {}
          : { meatTypeId: filter.meatTypeId }),
        ...price,
      },
      page,
    );
  }

  async findPublic(id: string): Promise<ProductDetails | null> {
    try {
      const row = await this.db.client.product.findFirst({
        where: { id, ...this.publicWhere() },
        include: PRODUCT_DETAILS_INCLUDE,
      });
      return row === null ? null : toProductDetails(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /**
   * The text search's pattern: the query normalised by the same SQL function as the
   * stored `search_text` (`catalog_search_text`, one definition, in the migration), then
   * its LIKE wildcards escaped so `%` and `_` match themselves.
   */
  private async searchPattern(text: string): Promise<string> {
    try {
      const rows = await this.db.client.$queryRaw<
        unknown[]
      >`SELECT catalog_search_text(${text}) AS "normalized"`;
      const row = rows[0];
      const normalized =
        typeof row === 'object' &&
        row !== null &&
        'normalized' in row &&
        typeof row.normalized === 'string'
          ? row.normalized
          : '';
      return escapeLikePattern(normalized);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /**
   * What the public may see: published and available (index conditions of the
   * `products_listing_*` indexes), of an active vendor (a read-only join to
   * `vendors.status`), in an active category.
   */
  private publicWhere(): Prisma.ProductWhereInput {
    return {
      status: 'published',
      isAvailable: true,
      vendor: { is: { status: 'active' } },
      category: { is: { isActive: true } },
    };
  }

  private async summaries(
    where: Prisma.ProductWhereInput,
    page: PageRequest,
  ): Promise<Page<ProductSummary>> {
    try {
      const rows = await this.db.client.product.findMany({
        where: { ...where, ...keysetAfter(page.cursor) },
        orderBy: [...KEYSET_ORDER],
        take: page.limit + 1,
        select: PRODUCT_SUMMARY_SELECT,
      });
      return toPage(rows.map(toProductSummary), page.limit);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /**
   * Sets `min_price_halalas` to the lowest price among the product's stored sizes (null
   * for none), read in the caller's transaction after its own size writes, and returns
   * the product as saved. Never worked out from a request, which can disagree with what
   * is stored.
   */
  private async refreshMinPrice(id: string): Promise<ProductDetails> {
    const client = this.db.client;
    const { _min } = await client.productSize.aggregate({
      where: { productId: id },
      _min: { priceHalalas: true },
    });
    await client.product.updateMany({
      where: { id },
      data: { minPriceHalalas: _min.priceHalalas },
    });
    const row = await client.product.findUnique({
      where: { id },
      include: PRODUCT_DETAILS_INCLUDE,
    });
    if (row === null) {
      throw new Error(`Product ${id} vanished while saving it`);
    }
    return toProductDetails(row);
  }

  private productFields(content: ProductContent) {
    return {
      categoryId: content.categoryId,
      meatTypeId: content.meatTypeId,
      nameAr: content.name.ar,
      nameEn: content.name.en,
      descriptionAr: content.description.ar,
      descriptionEn: content.description.en,
    };
  }

  private imageRows(content: ProductContent) {
    return content.imageMediaIds.map((mediaId, position) => ({
      mediaId,
      position,
    }));
  }

  /** A size's fields but its price, written only for a new size or by setPrices. */
  private sizeFields(size: ProductContent['sizes'][number]) {
    return {
      approxWeightGrams: size.approxWeightGrams,
      tagAr: size.tag?.ar ?? null,
      tagEn: size.tag?.en ?? null,
    };
  }

  private cuttingRows(content: ProductContent) {
    return content.cuttings.map((cutting) => ({
      cuttingStyleId: cutting.cuttingStyleId,
      extraPriceHalalas: cutting.extraPrice.halalas,
    }));
  }

  private packagingRows(content: ProductContent) {
    return content.packagings.map((option) => ({
      packaging: option.packaging,
      extraPriceHalalas: option.extraPrice.halalas,
    }));
  }
}
