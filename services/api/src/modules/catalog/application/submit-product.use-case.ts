import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { TransactionRunner } from '@infra/database/transaction-runner';
import {
  CATALOG_MEDIA,
  type CatalogMedia,
} from '../domain/ports/catalog-media.port';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../domain/ports/product.repository.port';
import { Product } from '../domain/product.entity';
import { ProductStatusMachine } from '../domain/product-status.state-machine';
import { lockProduct } from './lock-product';
import type { ProductView } from './product-view.type';
import { toProductView } from './to-product-view';

/**
 * A vendor sends a draft or rejected product to admin review (FR-VND-03). It must meet
 * the submission rules (PRODUCT_NOT_SUBMITTABLE); any other status is
 * PRODUCT_NOT_EDITABLE. The move is a conditional update, so a concurrent change of
 * status refuses it the same way. The vendor is the token's: another vendor's product
 * is NOT_FOUND.
 */
@Injectable()
export class SubmitProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: Readonly<{ vendorId: string; productId: string }>,
  ): Promise<ProductView> {
    const submitted = await this.transactions.run(async () => {
      const live = await lockProduct(
        input.productId,
        input.vendorId,
        this.products,
      );
      ProductStatusMachine.assertCanMove(live.status, 'pending_review');
      const content = Product.contentOf(live);
      Product.assertSubmittable(content);
      const moved = await this.products.transition(live.id, live.status, {
        to: 'pending_review',
        reviewerId: null,
        rejectionReason: null,
      });
      if (!moved) {
        throw new AppError(ErrorCode.PRODUCT_NOT_EDITABLE);
      }
      return this.products.findDetails(live.id, input.vendorId);
    });
    if (submitted === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return toProductView(submitted, null, this.media);
  }
}
