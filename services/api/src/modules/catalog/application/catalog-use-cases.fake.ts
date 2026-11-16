import { InMemoryAuditLog } from '@infra/audit/in-memory-audit-log.fake';
import type { TransactionRunner } from '@infra/database/transaction-runner';
import { InMemoryCatalogMedia } from '../domain/fakes/in-memory-catalog-media.fake';
import { InMemoryCatalogVendors } from '../domain/fakes/in-memory-catalog-vendors.fake';
import { InMemoryCuttingPackagingIncompatibilities } from '../domain/fakes/in-memory-cutting-packaging-incompatibilities.fake';
import { InMemoryProductChangeRequests } from '../domain/fakes/in-memory-product-change-requests.fake';
import { InMemoryProductLocks } from '../domain/fakes/in-memory-product-locks.fake';
import { InMemoryProductRepository } from '../domain/fakes/in-memory-product.repository.fake';
import { InMemoryReferenceLists } from '../domain/fakes/in-memory-reference-lists.fake';
import { ApproveProductChangeRequestUseCase } from './approve-product-change-request.use-case';
import { ApproveProductUseCase } from './approve-product.use-case';
import { ChangeProductPricesUseCase } from './change-product-prices.use-case';
import { CreateCuttingPackagingIncompatibilityUseCase } from './create-cutting-packaging-incompatibility.use-case';
import { CreateProductUseCase } from './create-product.use-case';
import { CreateReferenceItemUseCase } from './create-reference-item.use-case';
import { DeleteCuttingPackagingIncompatibilityUseCase } from './delete-cutting-packaging-incompatibility.use-case';
import { GetProductUseCase } from './get-product.use-case';
import { GetPublicProductUseCase } from './get-public-product.use-case';
import { ListCuttingPackagingIncompatibilitiesUseCase } from './list-cutting-packaging-incompatibilities.use-case';
import { ListProductChangeRequestsUseCase } from './list-product-change-requests.use-case';
import { ListProductsUseCase } from './list-products.use-case';
import { ListPublicProductsUseCase } from './list-public-products.use-case';
import { ListReferenceItemsUseCase } from './list-reference-items.use-case';
import { PublishPlatformProductUseCase } from './publish-platform-product.use-case';
import { RejectProductChangeRequestUseCase } from './reject-product-change-request.use-case';
import { RejectProductUseCase } from './reject-product.use-case';
import { SetProductAvailabilityUseCase } from './set-product-availability.use-case';
import { SetProductFulfilmentUseCase } from './set-product-fulfilment.use-case';
import { SubmitProductUseCase } from './submit-product.use-case';
import { UpdateProductContentUseCase } from './update-product-content.use-case';
import { UpdateReferenceItemUseCase } from './update-reference-item.use-case';

/**
 * Every use case of the catalog wired to the in-memory fakes, for the unit tests: no
 * database, no Nest application. A fake transaction puts back what its work wrote to
 * the fakes when the work throws, as a rollback would, and holds the product locks taken
 * in it until it ends (a write without its product's lock throws).
 */
export function buildCatalogUseCases() {
  const lists = new InMemoryReferenceLists();
  const rules = new InMemoryCuttingPackagingIncompatibilities();
  const locks = new InMemoryProductLocks();
  const products = new InMemoryProductRepository(lists, locks);
  const changeRequests = new InMemoryProductChangeRequests(locks);
  const media = new InMemoryCatalogMedia();
  const vendors = new InMemoryCatalogVendors();
  const audit = new InMemoryAuditLog();

  const transactions: Pick<TransactionRunner, 'run'> = {
    async run<T>(work: () => Promise<T>): Promise<T> {
      const before = {
        products: products.rows,
        changeRequests: changeRequests.rows,
        audit: audit.rows,
      };
      locks.begin();
      try {
        return await work();
      } catch (error) {
        products.rows = before.products;
        changeRequests.rows = before.changeRequests;
        audit.rows = before.audit;
        throw error;
      } finally {
        locks.end();
      }
    },
  };

  return {
    lists,
    rules,
    products,
    changeRequests,
    media,
    vendors,
    audit,
    createReferenceItem: new CreateReferenceItemUseCase(lists),
    updateReferenceItem: new UpdateReferenceItemUseCase(lists),
    listReferenceItems: new ListReferenceItemsUseCase(lists),
    createIncompatibility: new CreateCuttingPackagingIncompatibilityUseCase(
      rules,
      lists,
    ),
    listIncompatibilities: new ListCuttingPackagingIncompatibilitiesUseCase(
      rules,
    ),
    deleteIncompatibility: new DeleteCuttingPackagingIncompatibilityUseCase(
      rules,
    ),
    createProduct: new CreateProductUseCase(
      products,
      lists,
      media,
      vendors,
      transactions,
    ),
    updateContent: new UpdateProductContentUseCase(
      products,
      changeRequests,
      lists,
      rules,
      media,
      vendors,
      audit,
      transactions,
    ),
    submitProduct: new SubmitProductUseCase(
      products,
      rules,
      media,
      transactions,
    ),
    publishPlatformProduct: new PublishPlatformProductUseCase(
      products,
      rules,
      media,
      vendors,
      audit,
      transactions,
    ),
    setAvailability: new SetProductAvailabilityUseCase(
      products,
      media,
      vendors,
      transactions,
    ),
    setFulfilment: new SetProductFulfilmentUseCase(
      products,
      media,
      vendors,
      transactions,
    ),
    changePrices: new ChangeProductPricesUseCase(
      products,
      media,
      vendors,
      audit,
      transactions,
    ),
    getProduct: new GetProductUseCase(products, changeRequests, media),
    listProducts: new ListProductsUseCase(products, media, vendors),
    approveProduct: new ApproveProductUseCase(
      products,
      media,
      audit,
      transactions,
    ),
    rejectProduct: new RejectProductUseCase(
      products,
      media,
      audit,
      transactions,
    ),
    listChangeRequests: new ListProductChangeRequestsUseCase(changeRequests),
    approveChangeRequest: new ApproveProductChangeRequestUseCase(
      products,
      changeRequests,
      media,
      audit,
      transactions,
    ),
    rejectChangeRequest: new RejectProductChangeRequestUseCase(
      products,
      changeRequests,
      audit,
      transactions,
    ),
    listPublicProducts: new ListPublicProductsUseCase(products, media, vendors),
    getPublicProduct: new GetPublicProductUseCase(products, media, vendors),
  };
}

export type CatalogKit = ReturnType<typeof buildCatalogUseCases>;
