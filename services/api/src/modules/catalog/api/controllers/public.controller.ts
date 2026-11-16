import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
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
@ApiTags('catalog')
@Controller('public')
export class PublicCatalogController {
  constructor(
    private readonly listCategories: ListPublicCategoriesUseCase,
    private readonly listProducts: ListPublicProductsUseCase,
    private readonly getProduct: GetPublicProductUseCase,
  ) {}

  @Get('categories')
  @ApiOperation({
    summary: 'The active categories, in the order admins set',
    description:
      'Every active category, by `sortOrder` (lower first) then oldest first; the whole list, not paged.',
  })
  @ApiOkResponse({ type: PublicCategoryListResponseDto })
  @ApiErrorResponses(ErrorCode.RATE_LIMITED)
  async categories(): Promise<PublicCategoryListResponseDto> {
    return {
      items: (await this.listCategories.execute()).map(toReferenceItemResponse),
    };
  }

  @Get('products')
  @ApiOperation({
    summary: 'Products, newest first, with filters',
    description:
      'Filter by category, vendor, meat type and the lowest size price (halalas, both ends included).',
  })
  @ApiOkResponse({ type: ProductCardPageResponseDto })
  @ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ErrorCode.RATE_LIMITED)
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
  @ApiOperation({ summary: 'One product with every option' })
  @ApiOkResponse({ type: PublicProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.RATE_LIMITED,
  )
  async product(
    @Param() params: IdParamDto,
  ): Promise<PublicProductResponseDto> {
    return toPublicProductResponse(await this.getProduct.execute(params.id));
  }
}
