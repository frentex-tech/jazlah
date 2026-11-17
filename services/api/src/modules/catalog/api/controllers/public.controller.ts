import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { GetPublicProductUseCase } from '../../application/get-public-product.use-case';
import { ListPublicProductsUseCase } from '../../application/list-public-products.use-case';
import { ListPublicCategoriesUseCase } from '../../application/list-public-categories.use-case';
import { ListPublicProductsQueryDto } from '../dto/list-public-products-query.dto';
import { ProductCardPageResponseDto } from '../dto/product-card-page-response.dto';
import { PublicProductResponseDto } from '../dto/public-product-response.dto';
import { PublicCategoryListResponseDto } from '../dto/public-category-list-response.dto';
import { toProductCardResponse } from '../to-product-card-response';
import { toPublicProductResponse } from '../to-public-product-response';
import { toPublicProductFilter } from '../to-public-product-filter';
import { toReferenceItemResponse } from '../to-reference-item-response';

/**
 * Browsing the catalog without signing in (FR-CAT-01, FR-CAT-03, FR-PRD-01 to 05, 07).
 * Only published, available products of active vendors in active categories appear; any
 * other product is NOT_FOUND, exactly like a missing one.
 */
@ApiTags(API_TAGS.publicCatalog.name)
@Controller('public')
export class PublicCatalogController {
  constructor(
    private readonly listCategories: ListPublicCategoriesUseCase,
    private readonly listProducts: ListPublicProductsUseCase,
    private readonly getProduct: GetPublicProductUseCase,
  ) {}

  @Get('categories')
  @ApiOperation({
    operationId: 'publicListCategories',
    summary: 'The active categories, in the order admins set',
    description:
      'Customer app and web, home screen and category menu; public, no sign-in needed. Every active category, by `sortOrder` (lower first), then oldest first. The whole list in one answer, not paged. An inactive category is left out, and so are its products everywhere in the public catalog. Filter products by a category with GET /v1/public/products?categoryId=….',
  })
  @ApiOkResponse({
    type: PublicCategoryListResponseDto,
    description: 'Every active category, in display order.',
  })
  @ApiErrorResponses(ErrorCode.RATE_LIMITED, ErrorCode.SERVICE_UNAVAILABLE)
  async categories(): Promise<PublicCategoryListResponseDto> {
    return {
      items: (await this.listCategories.execute()).map(toReferenceItemResponse),
    };
  }

  @Get('products')
  @ApiOperation({
    operationId: 'publicListProducts',
    summary: 'Products, newest first, with filters',
    description:
      'Customer app and web, product lists (home, a category, a store, search by price); public, no sign-in needed. Only products customers can buy: published, switched on (available), of an active (not suspended) vendor, in an active category. Newest first; keyset paging: send `nextCursor` back as `cursor` until it is null; no total count. ' +
      'Optional filters, combined: `categoryId`, `vendorId`, `meatTypeId`, and a range on the product’s lowest size price in halalas, VAT included (`minPriceHalalas`, `maxPriceHalalas`, both ends included; a range with min above max simply finds nothing). An unknown id finds nothing rather than an error.',
  })
  @ApiOkResponse({
    type: ProductCardPageResponseDto,
    description: 'One page of products as cards.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.RATE_LIMITED,
    ErrorCode.SERVICE_UNAVAILABLE,
  )
  async products(
    @Query() query: ListPublicProductsQueryDto,
  ): Promise<ProductCardPageResponseDto> {
    const page = await this.listProducts.execute(
      toPublicProductFilter(query),
      toPageRequest(query),
    );
    return {
      items: page.items.map(toProductCardResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Get('products/:id')
  @ApiOperation({
    operationId: 'publicGetProduct',
    summary: 'One product with every option',
    description:
      'Customer app and web, product page; public, no sign-in needed. The product with what a customer chooses from: sizes (approximate weight and price), cutting styles (extra price), packagings, "without" items, and how it is fulfilled (delivery, pickup or both). Prices are integer halalas, VAT included. ' +
      'NOT_FOUND for an unknown id and also for any product customers cannot buy now (not published, switched off, its vendor suspended or its category inactive): show it as no longer available.',
  })
  @ApiOkResponse({
    type: PublicProductResponseDto,
    description: 'The product with every option.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.RATE_LIMITED,
    ErrorCode.SERVICE_UNAVAILABLE,
  )
  async product(
    @Param() params: IdParamDto,
  ): Promise<PublicProductResponseDto> {
    return toPublicProductResponse(await this.getProduct.execute(params.id));
  }
}
