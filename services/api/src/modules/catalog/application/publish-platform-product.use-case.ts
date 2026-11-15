import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
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
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../domain/ports/product.repository.port';
import { Product } from '../domain/product.entity';
import { ProductStatusMachine } from '../domain/product-status.state-machine';
import { findWritableProduct } from './find-writable-product';
import type { ProductView } from './product-view.type';
import { toProductView } from './to-product-view';

/**
 * An admin publishes one of JAZLA's own draft products directly, without review
 * (FR-ADM-02). Only the platform vendor's products (another vendor's is NOT_FOUND),
 * only from draft (PRODUCT_NOT_EDITABLE otherwise), and only if it meets the submission
 * rules (PRODUCT_NOT_SUBMITTABLE). One transaction: the move and its audit entry.
 */
@Injectable()
export class PublishPlatformProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
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
    input: Readonly<{ actorId: string; productId: string }>,
  ): Promise<ProductView> {
    const live = await findWritableProduct(
      { kind: 'platform' },
      input.productId,
      this.products,
      this.vendors,
    );
    if (live.status !== 'draft') {
      throw new AppError(ErrorCode.PRODUCT_NOT_EDITABLE, {
        details: { status: live.status },
      });
    }
    ProductStatusMachine.assertCanMove(live.status, 'published');
    const content = Product.contentOf(live);
    Product.assertSubmittable(
      content,
      await this.rules.findForCuttingStyles(
        content.cuttings.map((cutting) => cutting.cuttingStyleId),
      ),
    );
    const published = await this.transactions.run(async () => {
      const moved = await this.products.transition(live.id, 'draft', {
        to: 'published',
        reviewerId: input.actorId,
        rejectionReason: null,
      });
      if (!moved) {
        throw new AppError(ErrorCode.PRODUCT_NOT_EDITABLE);
      }
      await this.audit.write({
        actorId: input.actorId,
        ...CATALOG_AUDIT.productPublished,
        entityId: live.id,
      });
      return this.products.findDetails(live.id, null);
    });
    if (published === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return toProductView(published, null, this.media);
  }
}
