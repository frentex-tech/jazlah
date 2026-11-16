import { Module } from '@nestjs/common';
import { AuditModule } from '@infra/audit/audit.module';
import { MediaModule } from '@modules/media';
import { VendorsModule } from '@modules/vendors';
import { AdminCatalogController } from './api/controllers/admin.controller';
import { PublicCatalogController } from './api/controllers/public.controller';
import { VendorCatalogController } from './api/controllers/vendor.controller';
import { ApproveProductChangeRequestUseCase } from './application/approve-product-change-request.use-case';
import { ApproveProductUseCase } from './application/approve-product.use-case';
import { ChangeProductPricesUseCase } from './application/change-product-prices.use-case';
import { CreateCuttingPackagingIncompatibilityUseCase } from './application/create-cutting-packaging-incompatibility.use-case';
import { CreateProductUseCase } from './application/create-product.use-case';
import { CreateReferenceItemUseCase } from './application/create-reference-item.use-case';
import { DeleteCuttingPackagingIncompatibilityUseCase } from './application/delete-cutting-packaging-incompatibility.use-case';
import { GetProductUseCase } from './application/get-product.use-case';
import { GetPublicProductUseCase } from './application/get-public-product.use-case';
import { ListCuttingPackagingIncompatibilitiesUseCase } from './application/list-cutting-packaging-incompatibilities.use-case';
import { ListProductChangeRequestsUseCase } from './application/list-product-change-requests.use-case';
import { ListProductsUseCase } from './application/list-products.use-case';
import { ListPublicProductsUseCase } from './application/list-public-products.use-case';
import { ListPublicCategoriesUseCase } from './application/list-public-categories.use-case';
import { ListReferenceItemsUseCase } from './application/list-reference-items.use-case';
import { PublishPlatformProductUseCase } from './application/publish-platform-product.use-case';
import { RejectProductChangeRequestUseCase } from './application/reject-product-change-request.use-case';
import { RejectProductUseCase } from './application/reject-product.use-case';
import { SetProductAvailabilityUseCase } from './application/set-product-availability.use-case';
import { SetProductFulfilmentUseCase } from './application/set-product-fulfilment.use-case';
import { SubmitProductUseCase } from './application/submit-product.use-case';
import { UpdateProductContentUseCase } from './application/update-product-content.use-case';
import { UpdateReferenceItemUseCase } from './application/update-reference-item.use-case';
import { CATALOG_MEDIA } from './domain/ports/catalog-media.port';
import { CATALOG_VENDORS } from './domain/ports/catalog-vendors.port';
import { CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY } from './domain/ports/cutting-packaging-incompatibility.repository.port';
import { PRODUCT_CHANGE_REQUEST_REPOSITORY } from './domain/ports/product-change-request.repository.port';
import { PRODUCT_REPOSITORY } from './domain/ports/product.repository.port';
import { REFERENCE_LIST_REPOSITORY } from './domain/ports/reference-list.repository.port';
import { MediaServiceCatalogMedia } from './infrastructure/media-service-catalog-media';
import { PrismaCuttingPackagingIncompatibilityRepository } from './infrastructure/prisma-cutting-packaging-incompatibility.repository';
import { PrismaProductChangeRequestRepository } from './infrastructure/prisma-product-change-request.repository';
import { PrismaProductRepository } from './infrastructure/prisma-product.repository';
import { PrismaReferenceListRepository } from './infrastructure/prisma-reference-list.repository';
import { VendorDirectoryCatalogVendors } from './infrastructure/vendor-directory-catalog-vendors';

/**
 * The catalog module (four layers: products have a review state machine and prices):
 * the admin lists, the cutting and packaging rules, products with their options, their
 * review and change requests, and public browsing. Its vendor routes are covered by the
 * organisation status guard like every vendor route.
 */
@Module({
  imports: [AuditModule, MediaModule, VendorsModule],
  controllers: [
    VendorCatalogController,
    AdminCatalogController,
    PublicCatalogController,
  ],
  providers: [
    CreateReferenceItemUseCase,
    UpdateReferenceItemUseCase,
    ListReferenceItemsUseCase,
    ListPublicCategoriesUseCase,
    CreateCuttingPackagingIncompatibilityUseCase,
    ListCuttingPackagingIncompatibilitiesUseCase,
    DeleteCuttingPackagingIncompatibilityUseCase,
    CreateProductUseCase,
    UpdateProductContentUseCase,
    SubmitProductUseCase,
    PublishPlatformProductUseCase,
    SetProductAvailabilityUseCase,
    SetProductFulfilmentUseCase,
    ChangeProductPricesUseCase,
    GetProductUseCase,
    ListProductsUseCase,
    ApproveProductUseCase,
    RejectProductUseCase,
    ListProductChangeRequestsUseCase,
    ApproveProductChangeRequestUseCase,
    RejectProductChangeRequestUseCase,
    ListPublicProductsUseCase,
    GetPublicProductUseCase,
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    {
      provide: PRODUCT_CHANGE_REQUEST_REPOSITORY,
      useClass: PrismaProductChangeRequestRepository,
    },
    {
      provide: REFERENCE_LIST_REPOSITORY,
      useClass: PrismaReferenceListRepository,
    },
    {
      provide: CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY,
      useClass: PrismaCuttingPackagingIncompatibilityRepository,
    },
    { provide: CATALOG_MEDIA, useClass: MediaServiceCatalogMedia },
    { provide: CATALOG_VENDORS, useClass: VendorDirectoryCatalogVendors },
  ],
})
export class CatalogModule {}
