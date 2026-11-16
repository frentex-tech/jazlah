import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { organisationOf } from '@common/auth/organisation-of';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { VENDOR_AUTH_ERRORS } from '@common/decorators/vendor-auth-errors.constants';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
import { ChangeProductPricesUseCase } from '../../application/change-product-prices.use-case';
import { CreateProductUseCase } from '../../application/create-product.use-case';
import { GetProductUseCase } from '../../application/get-product.use-case';
import { ListProductsUseCase } from '../../application/list-products.use-case';
import { SetProductAvailabilityUseCase } from '../../application/set-product-availability.use-case';
import { SetProductFulfilmentUseCase } from '../../application/set-product-fulfilment.use-case';
import { SubmitProductUseCase } from '../../application/submit-product.use-case';
import { UpdateProductContentUseCase } from '../../application/update-product-content.use-case';
import { ChangeProductPricesDto } from '../dto/change-product-prices.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { ListProductsQueryDto } from '../dto/list-products-query.dto';
import { ProductCardPageResponseDto } from '../dto/product-card-page-response.dto';
import { ProductContentDto } from '../dto/product-content.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { SetProductAvailabilityDto } from '../dto/set-product-availability.dto';
import { SetProductFulfilmentDto } from '../dto/set-product-fulfilment.dto';
import { PRODUCT_CONTENT_ERRORS } from '../product-content-errors.constants';
import { toPriceChanges } from '../to-price-changes';
import { toProductCardResponse } from '../to-product-card-response';
import { toProductContent } from '../to-product-content';
import { toProductResponse } from '../to-product-response';

/**
 * A vendor's own products (FR-VND-03). The vendor is always the access token's
 * organisation: another vendor's product is NOT_FOUND, exactly like a missing one.
 */
@ApiTags('catalog')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('vendor/products')
export class VendorCatalogController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly updateContent: UpdateProductContentUseCase,
    private readonly submitProduct: SubmitProductUseCase,
    private readonly setAvailability: SetProductAvailabilityUseCase,
    private readonly setFulfilment: SetProductFulfilmentUseCase,
    private readonly changePrices: ChangeProductPricesUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a draft product',
    description:
      'Upload each image first (POST /v1/vendor/media/uploads, purpose catalog.product-image) and confirm it. A draft may be incomplete; submit it for review when ready.',
  })
  @ApiCreatedResponse({ type: ProductResponseDto })
  @ApiErrorResponses(...PRODUCT_CONTENT_ERRORS, ...VENDOR_AUTH_ERRORS)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.createProduct.execute({
        scope: { kind: 'vendor', vendorId: organisationOf(user) },
        actorId: user.userId,
        fulfilment: body.fulfilment,
        content: toProductContent(body),
      }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'My products, newest first' })
  @ApiOkResponse({ type: ProductCardPageResponseDto })
  @ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ...VENDOR_AUTH_ERRORS)
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListProductsQueryDto,
  ): Promise<ProductCardPageResponseDto> {
    const page = await this.listProducts.execute(
      { kind: 'vendor', vendorId: organisationOf(user) },
      query.status === undefined ? {} : { status: query.status },
      toPageRequest(query),
    );
    return {
      items: page.items.map(toProductCardResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'One of my products',
    description:
      'With its latest change request (pending, or the last decided one).',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ...VENDOR_AUTH_ERRORS,
  )
  async read(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.getProduct.execute(
        { kind: 'vendor', vendorId: organisationOf(user) },
        params.id,
      ),
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Replace a product’s content',
    description:
      'A draft or rejected product changes at once. On a published product the edit becomes its one pending change request (replacing any pending one) while the live version stays; existing sizes and cuttings must keep their live prices (change them with PATCH …/prices), and the submission rules apply. PRODUCT_NOT_EDITABLE while under review.',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ...PRODUCT_CONTENT_ERRORS,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.PRODUCT_NOT_SUBMITTABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ...VENDOR_AUTH_ERRORS,
  )
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: ProductContentDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.updateContent.execute({
        scope: { kind: 'vendor', vendorId: organisationOf(user) },
        actorId: user.userId,
        productId: params.id,
        content: toProductContent(body),
      }),
    );
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a draft or rejected product to review',
    description:
      'PRODUCT_NOT_SUBMITTABLE without a size or an image, or with a cutting style and a packaging that do not go together.',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.PRODUCT_NOT_SUBMITTABLE,
    ...VENDOR_AUTH_ERRORS,
  )
  async submit(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.submitProduct.execute({
        vendorId: organisationOf(user),
        productId: params.id,
      }),
    );
  }

  @Patch(':id/availability')
  @ApiOperation({
    summary: 'Switch a product on or off',
    description: 'Applies at once, also on a published product.',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ...VENDOR_AUTH_ERRORS,
  )
  async availability(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: SetProductAvailabilityDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.setAvailability.execute({
        scope: { kind: 'vendor', vendorId: organisationOf(user) },
        productId: params.id,
        isAvailable: body.isAvailable,
      }),
    );
  }

  @Patch(':id/fulfilment')
  @ApiOperation({
    summary: 'Set delivery, pickup or both',
    description: 'Applies at once, also on a published product.',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ...VENDOR_AUTH_ERRORS,
  )
  async fulfilment(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: SetProductFulfilmentDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.setFulfilment.execute({
        scope: { kind: 'vendor', vendorId: organisationOf(user) },
        productId: params.id,
        fulfilment: body.fulfilment,
      }),
    );
  }

  @Patch(':id/prices')
  @ApiOperation({
    summary: 'Change size and cutting prices',
    description:
      'Applies at once, also on a published product; each change is recorded in the audit log.',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ...VENDOR_AUTH_ERRORS,
  )
  async prices(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: ChangeProductPricesDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.changePrices.execute({
        scope: { kind: 'vendor', vendorId: organisationOf(user) },
        actorId: user.userId,
        productId: params.id,
        changes: toPriceChanges(body),
      }),
    );
  }
}
