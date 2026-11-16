import { Inject, Injectable } from '@nestjs/common';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { CATALOG_AUDIT } from '../domain/catalog-audit-actions.constants';
import {
  CATALOG_MEDIA,
  type CatalogMedia,
} from '../domain/ports/catalog-media.port';
import {
  CATALOG_VENDORS,
  type CatalogVendors,
} from '../domain/ports/catalog-vendors.port';
import {
  CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY,
  type CuttingPackagingIncompatibilityRepository,
} from '../domain/ports/cutting-packaging-incompatibility.repository.port';
import {
  PRODUCT_CHANGE_REQUEST_REPOSITORY,
  type ProductChangeRequestRepository,
} from '../domain/ports/product-change-request.repository.port';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../domain/ports/product.repository.port';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import { Product } from '../domain/product.entity';
import type { ProductContent } from '../domain/product-content.type';
import { ProductStatusMachine } from '../domain/product-status.state-machine';
import { assertProductContent } from './assert-product-content';
import { findWritableProduct } from './find-writable-product';
import type { ProductView } from './product-view.type';
import type { ProductWriteScope } from './product-write-scope.type';
import { toProductView } from './to-product-view';

/**
 * Replaces a product's content (names, category, meat type, images, sizes, cuttings,
 * packagings, exclusions). By status:
 *
 * - under review: PRODUCT_NOT_EDITABLE;
 * - draft or rejected: saved at once (a rejected product stays rejected until submitted);
 * - published: existing sizes and cuttings must keep their live prices
 *   (Product.assertKeepsLivePrices; prices change through ChangeProductPrices) and the
 *   submission rules hold. A vendor's edit becomes the product's one pending change
 *   request (replacing any pending one) while the live version stays; an admin's edit
 *   of a JAZLA product applies at once, audited.
 *
 * One transaction for every save of the product's tables.
 */
@Injectable()
export class UpdateProductContentUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(PRODUCT_CHANGE_REQUEST_REPOSITORY)
    private readonly changeRequests: ProductChangeRequestRepository,
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
    @Inject(CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY)
    private readonly rules: CuttingPackagingIncompatibilityRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(CATALOG_VENDORS) private readonly vendors: CatalogVendors,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: Readonly<{
      scope: ProductWriteScope;
      actorId: string;
      productId: string;
      content: ProductContent;
    }>,
  ): Promise<ProductView> {
    Product.assertNoRepeats(input.content);
    const live = await findWritableProduct(
      input.scope,
      input.productId,
      this.products,
      this.vendors,
    );
    ProductStatusMachine.assertEditable(live.status);
    Product.assertOwnSizes(input.content, live);
    await assertProductContent(
      input.content,
      this.lists,
      this.media,
      input.actorId,
      live.imageMediaIds,
    );
    const minPrice = Product.minPriceOf(input.content.sizes);

    if (!ProductStatusMachine.needsChangeRequest(live.status)) {
      const saved = await this.transactions.run(() =>
        this.products.saveContent(live.id, input.content, minPrice),
      );
      return toProductView(
        saved,
        await this.changeRequests.findLatestOf(live.id),
        this.media,
      );
    }

    Product.assertKeepsLivePrices(input.content, live);
    Product.assertSubmittable(
      input.content,
      await this.rules.findForCuttingStyles(
        input.content.cuttings.map((cutting) => cutting.cuttingStyleId),
      ),
    );
    if (input.scope.kind === 'vendor') {
      const request = await this.changeRequests.savePending(
        live.id,
        input.actorId,
        input.content,
      );
      return toProductView(live, request, this.media);
    }
    const saved = await this.transactions.run(async () => {
      const product = await this.products.saveContent(
        live.id,
        input.content,
        minPrice,
      );
      await this.audit.write({
        actorId: input.actorId,
        ...CATALOG_AUDIT.productUpdated,
        entityId: live.id,
      });
      return product;
    });
    return toProductView(saved, null, this.media);
  }
}
