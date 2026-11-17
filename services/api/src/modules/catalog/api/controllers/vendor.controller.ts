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
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
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
@ApiTags(API_TAGS.vendorProducts.name)
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
    operationId: 'vendorCreateProduct',
    summary: 'Create a draft product',
    description:
      'Vendor dashboard, new product form. Creates a product of the signed-in vendor in status `draft`, available, with the content and fulfilment sent; nobody but the vendor and admins sees it until it is published. ' +
      'Upload each image first (POST /v1/vendor/media/uploads with purpose `catalog.product-image`, then POST /v1/vendor/media/{id}/confirm) and send the media ids in display order: the first is the cover. ' +
      'A draft may be incomplete (no size, no image): the submission rules apply only when it is submitted (POST …/{id}/submit). Prices are integer halalas, VAT included (`95000` is 950.00 SAR). ' +
      'Errors: VALIDATION_FAILED for an invalid body and also, with field details, for a category, meat type, cutting style or "without" item that is not an active entry (`isActiveCategory`, `isActiveMeatType`, `isActiveCuttingStyle`, `isActiveExclusionItem`) or a repeated cutting style (`isNotRepeated`); MEDIA_NOT_FOUND for an image id that is not a product image uploaded by this user; MEDIA_NOT_READY for an image whose upload was not confirmed (`details.mediaId` names it).',
  })
  @ApiCreatedResponse({
    type: ProductResponseDto,
    description: 'The new draft product.',
  })
  @ApiErrorResponses(
    ...PRODUCT_CONTENT_ERRORS,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...VENDOR_AUTH_ERRORS,
  )
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
  @ApiOperation({
    operationId: 'vendorListProducts',
    summary: 'My products, newest first',
    description:
      'Vendor dashboard, products list. The signed-in vendor’s own products in every status, newest first, optionally of one status (`draft`, `pending_review`, `published`, `rejected`). Keyset paging: send `nextCursor` back as `cursor` until it is null; no total count. ' +
      'Each card carries the lowest size price in halalas (VAT included) and the cover image URL. A pending change request does not show here: open the product (GET …/{id}).',
  })
  @ApiOkResponse({
    type: ProductCardPageResponseDto,
    description: 'One page of the vendor’s products.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...VENDOR_AUTH_ERRORS,
  )
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
    operationId: 'vendorGetProduct',
    summary: 'One of my products',
    description:
      'Vendor dashboard, product page and edit form. The product as it is live (or as the draft stands), with its status, the admin’s rejection reason when `rejected`, and its latest change request: the pending one with the proposed content, or the last decided one (approved, rejected with its reason, or superseded); null when there has never been one. ' +
      'NOT_FOUND for an unknown id and for another vendor’s product, answered the same way.',
  })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'The product with its latest change request.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.SERVICE_UNAVAILABLE,
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
    operationId: 'vendorUpdateProductContent',
    summary: 'Replace a product’s content',
    description:
      'Vendor dashboard, edit product form. Replaces the whole content (names, description, category, meat type, images, sizes, cutting styles, packagings, "without" items); send every field, lists in display order. Availability, fulfilment and prices have their own endpoints and are not changed here. ' +
      'By status: `draft` or `rejected`: saved at once (a rejected product stays rejected until submitted again). `published`: nothing changes on the live product; the edit becomes a new pending change request for admin review (any pending one is closed as `superseded`), returned in `changeRequest`, and it must meet the submission rules (at least one size and one image, no cutting style offered with a packaging it cannot be combined with). `pending_review`: refused with PRODUCT_NOT_EDITABLE until an admin decides. ' +
      'Keep an existing size by sending its `id`; a size left out is removed; a size without `id` is new. Existing sizes, cutting styles and packagings must carry their current prices (VALIDATION_FAILED `isLivePrice`): change prices with PATCH …/{id}/prices, which applies at once. New sizes, cutting styles and packagings take the prices sent (halalas, VAT included). ' +
      'Errors: VALIDATION_FAILED also for an inactive reference, a size id not of this product (`isSizeOfProduct`) or a repeat (`isNotRepeated`); MEDIA_NOT_FOUND / MEDIA_NOT_READY for a new image not uploaded and confirmed by this user; PRODUCT_NOT_SUBMITTABLE (published only) with `details.reasons` (NO_SIZE, NO_IMAGE, INCOMPATIBLE_CUTTING_PACKAGING with `details.pairs`); NOT_FOUND for an unknown id or another vendor’s product.',
  })
  @ApiOkResponse({
    type: ProductResponseDto,
    description:
      'The product: with the new content (draft, rejected), or unchanged with the new pending change request (published).',
  })
  @ApiErrorResponses(
    ...PRODUCT_CONTENT_ERRORS,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.PRODUCT_NOT_SUBMITTABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
    operationId: 'vendorSubmitProduct',
    summary: 'Send a draft or rejected product to review',
    description:
      'Vendor dashboard, "submit for review" on a draft or rejected product. Moves it to `pending_review`, where admins approve it (it becomes `published`) or reject it with a reason (`rejected`, editable and submittable again). While under review the product cannot be edited. No body. ' +
      'Errors: PRODUCT_NOT_SUBMITTABLE when the product has no size or no image, or offers a cutting style with a packaging it cannot be combined with: `details.reasons` lists every reason (NO_SIZE, NO_IMAGE, INCOMPATIBLE_CUTTING_PACKAGING) and `details.pairs` the incompatible pairs; PRODUCT_NOT_EDITABLE when the product is already under review or published (`details.status`); NOT_FOUND for an unknown id or another vendor’s product.',
  })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'The product, now `pending_review`.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.PRODUCT_NOT_SUBMITTABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
    operationId: 'vendorSetProductAvailability',
    summary: 'Switch a product on or off',
    description:
      'Vendor dashboard, the availability switch (out of stock, back in stock). Applies at once in every status but `pending_review`, also on a published product: no review. An unavailable published product leaves the public catalog at once and comes back when switched on. ' +
      'Errors: PRODUCT_NOT_EDITABLE while the product is under review (`details.status`); NOT_FOUND for an unknown id or another vendor’s product.',
  })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'The product with its new availability.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
    operationId: 'vendorSetProductFulfilment',
    summary: 'Set delivery, pickup or both',
    description:
      'Vendor dashboard, product page. Sets how the product reaches the customer: `delivery`, `pickup` or `both`. Applies at once in every status but `pending_review`, also on a published product: no review. ' +
      'Errors: PRODUCT_NOT_EDITABLE while the product is under review (`details.status`); NOT_FOUND for an unknown id or another vendor’s product.',
  })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'The product with its new fulfilment.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
    operationId: 'vendorChangeProductPrices',
    summary: 'Change size, cutting and packaging prices',
    description:
      'Vendor dashboard, prices form. Sets new prices for some of the product’s existing sizes (by size id), cutting styles (by cutting style id) and packagings (by packaging); the others keep theirs. Prices are integer halalas, VAT included. Applies at once in every status but `pending_review`, also on a published product: no review; the lowest price is updated and each price that actually changed is recorded in the audit log. A pending change request is not touched. ' +
      'Errors: VALIDATION_FAILED for an invalid body, a size, cutting style or packaging that is not the product’s (`isSizeOfProduct`, `isCuttingOfProduct`, `isPackagingOfProduct`) or named twice (`isNotRepeated`); PRODUCT_NOT_EDITABLE while the product is under review (`details.status`); NOT_FOUND for an unknown id or another vendor’s product.',
  })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'The product with its new prices.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
