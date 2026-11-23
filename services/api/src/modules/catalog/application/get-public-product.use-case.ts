import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
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
import type { PublicProductView } from './public-product-view.type';

/**
 * One product for anyone (FR-PRD-01 to 05, 07), with its options and the cutting and
 * packaging pairs a customer may not choose together (the rules among what it offers).
 * NOT_FOUND unless it is published, of an active vendor and in an active category: a
 * hidden product is answered exactly like a missing one. An unavailable product is
 * shown, marked so.
 */
@Injectable()
export class GetPublicProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(CATALOG_VENDORS) private readonly vendors: CatalogVendors,
    @Inject(CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY)
    private readonly rules: CuttingPackagingIncompatibilityRepository,
  ) {}

  async execute(productId: string): Promise<PublicProductView> {
    const product = await this.products.findPublic(productId);
    if (product === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    const [imageUrls, names, rules] = await Promise.all([
      this.media.publicUrls(product.imageMediaIds),
      this.vendors.namesOf([product.vendorId]),
      this.rules.findForCuttingStyles(
        product.cuttings.map((cutting) => cutting.cuttingStyleId),
      ),
    ]);
    const packagings = new Set(
      product.packagings.map((option) => option.packaging),
    );
    return {
      product,
      imageUrls,
      vendorName: names.get(product.vendorId) ?? null,
      incompatiblePairs: rules
        .filter((rule) => packagings.has(rule.packaging))
        .map((rule) => ({
          cuttingStyleId: rule.cuttingStyleId,
          packaging: rule.packaging,
        })),
    };
  }
}
