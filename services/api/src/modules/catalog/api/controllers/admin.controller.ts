import {
  Body,
  Controller,
  Delete,
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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { ADMIN_AUTH_ERRORS } from '@common/decorators/admin-auth-errors.constants';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IdParamDto } from '@common/dto/id-param.dto';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { ReasonDto } from '@common/dto/reason.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
import { ApproveProductChangeRequestUseCase } from '../../application/approve-product-change-request.use-case';
import { ApproveProductUseCase } from '../../application/approve-product.use-case';
import { ChangeProductPricesUseCase } from '../../application/change-product-prices.use-case';
import { CreateCuttingPackagingIncompatibilityUseCase } from '../../application/create-cutting-packaging-incompatibility.use-case';
import { CreateProductUseCase } from '../../application/create-product.use-case';
import { CreateReferenceItemUseCase } from '../../application/create-reference-item.use-case';
import { DeleteCuttingPackagingIncompatibilityUseCase } from '../../application/delete-cutting-packaging-incompatibility.use-case';
import { GetProductUseCase } from '../../application/get-product.use-case';
import { ListCuttingPackagingIncompatibilitiesUseCase } from '../../application/list-cutting-packaging-incompatibilities.use-case';
import { ListProductChangeRequestsUseCase } from '../../application/list-product-change-requests.use-case';
import { ListProductsUseCase } from '../../application/list-products.use-case';
import { ListReferenceItemsUseCase } from '../../application/list-reference-items.use-case';
import { PublishPlatformProductUseCase } from '../../application/publish-platform-product.use-case';
import { RejectProductChangeRequestUseCase } from '../../application/reject-product-change-request.use-case';
import { RejectProductUseCase } from '../../application/reject-product.use-case';
import { SetProductAvailabilityUseCase } from '../../application/set-product-availability.use-case';
import { SetProductFulfilmentUseCase } from '../../application/set-product-fulfilment.use-case';
import { UpdateProductContentUseCase } from '../../application/update-product-content.use-case';
import { UpdateReferenceItemUseCase } from '../../application/update-reference-item.use-case';
import { AdminListProductsQueryDto } from '../dto/admin-list-products-query.dto';
import { ChangeProductPricesDto } from '../dto/change-product-prices.dto';
import { CreateCuttingPackagingIncompatibilityDto } from '../dto/create-cutting-packaging-incompatibility.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { CreateReferenceItemDto } from '../dto/create-reference-item.dto';
import { CuttingPackagingIncompatibilityPageResponseDto } from '../dto/cutting-packaging-incompatibility-page-response.dto';
import { CuttingPackagingIncompatibilityResponseDto } from '../dto/cutting-packaging-incompatibility-response.dto';
import { ListReferenceItemsQueryDto } from '../dto/list-reference-items-query.dto';
import { ProductCardPageResponseDto } from '../dto/product-card-page-response.dto';
import { ProductChangeRequestPageResponseDto } from '../dto/product-change-request-page-response.dto';
import { ProductContentDto } from '../dto/product-content.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ReferenceItemPageResponseDto } from '../dto/reference-item-page-response.dto';
import { ReferenceItemParamDto } from '../dto/reference-item-param.dto';
import { ReferenceItemResponseDto } from '../dto/reference-item-response.dto';
import { ReferenceListParamDto } from '../dto/reference-list-param.dto';
import { SetProductAvailabilityDto } from '../dto/set-product-availability.dto';
import { SetProductFulfilmentDto } from '../dto/set-product-fulfilment.dto';
import { UpdateReferenceItemDto } from '../dto/update-reference-item.dto';
import { PLATFORM_SCOPE } from '../platform-scope.constants';
import { PRODUCT_CONTENT_ERRORS } from '../product-content-errors.constants';
import { toChangeRequestResponse } from '../to-change-request-response';
import { toIncompatibilityResponse } from '../to-incompatibility-response';
import { toPriceChanges } from '../to-price-changes';
import { toProductCardResponse } from '../to-product-card-response';
import { toProductContent } from '../to-product-content';
import { toProductResponse } from '../to-product-response';
import { toReferenceItemResponse } from '../to-reference-item-response';
import { toReferenceList } from '../to-reference-list';

/**
 * The catalog for admins (FR-ADM-02): the lists (categories, meat types, cutting
 * styles, "without" items), the cutting and packaging rules, the review of vendors'
 * products and change requests, and JAZLA's own products (the platform vendor's),
 * written and published directly. Every decision is audited.
 */
@ApiTags('catalog')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin')
export class AdminCatalogController {
  constructor(
    private readonly createItem: CreateReferenceItemUseCase,
    private readonly updateItem: UpdateReferenceItemUseCase,
    private readonly listItems: ListReferenceItemsUseCase,
    private readonly createRule: CreateCuttingPackagingIncompatibilityUseCase,
    private readonly listRules: ListCuttingPackagingIncompatibilitiesUseCase,
    private readonly deleteRule: DeleteCuttingPackagingIncompatibilityUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly approveProduct: ApproveProductUseCase,
    private readonly rejectProduct: RejectProductUseCase,
    private readonly listChangeRequests: ListProductChangeRequestsUseCase,
    private readonly approveChangeRequest: ApproveProductChangeRequestUseCase,
    private readonly rejectChangeRequest: RejectProductChangeRequestUseCase,
    private readonly createProduct: CreateProductUseCase,
    private readonly updateContent: UpdateProductContentUseCase,
    private readonly publishProduct: PublishPlatformProductUseCase,
    private readonly setAvailability: SetProductAvailabilityUseCase,
    private readonly setFulfilment: SetProductFulfilmentUseCase,
    private readonly changePrices: ChangeProductPricesUseCase,
  ) {}

  // The lists.

  @Post('lists/:list')
  @ApiOperation({
    summary: 'Add an entry to a list (it starts active)',
    description:
      'A category may take its display order (`sortOrder`, 0 by default); another list refuses one.',
  })
  @ApiCreatedResponse({ type: ReferenceItemResponseDto })
  @ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ...ADMIN_AUTH_ERRORS)
  async createListItem(
    @Param() params: ReferenceListParamDto,
    @Body() body: CreateReferenceItemDto,
  ): Promise<ReferenceItemResponseDto> {
    return toReferenceItemResponse(
      await this.createItem.execute(toReferenceList(params.list), {
        name: body.name,
        ...(body.sortOrder === undefined ? {} : { sortOrder: body.sortOrder }),
      }),
    );
  }

  @Get('lists/:list')
  @ApiOperation({ summary: 'The entries of a list, newest first' })
  @ApiOkResponse({ type: ReferenceItemPageResponseDto })
  @ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ...ADMIN_AUTH_ERRORS)
  async listListItems(
    @Param() params: ReferenceListParamDto,
    @Query() query: ListReferenceItemsQueryDto,
  ): Promise<ReferenceItemPageResponseDto> {
    const page = await this.listItems.execute(
      toReferenceList(params.list),
      query.isActive === undefined ? {} : { isActive: query.isActive },
      toPageRequest(query),
    );
    return {
      items: page.items.map(toReferenceItemResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Patch('lists/:list/:id')
  @ApiOperation({
    summary: 'Rename an entry, switch it on or off, or reorder a category',
    description:
      'An inactive entry can no longer be chosen; an inactive category hides its products from the public at once. `sortOrder` (categories only) sets the public order.',
  })
  @ApiOkResponse({ type: ReferenceItemResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ...ADMIN_AUTH_ERRORS,
  )
  async updateListItem(
    @Param() params: ReferenceItemParamDto,
    @Body() body: UpdateReferenceItemDto,
  ): Promise<ReferenceItemResponseDto> {
    return toReferenceItemResponse(
      await this.updateItem.execute(toReferenceList(params.list), params.id, {
        ...(body.name === undefined ? {} : { name: body.name }),
        ...(body.isActive === undefined ? {} : { isActive: body.isActive }),
        ...(body.sortOrder === undefined ? {} : { sortOrder: body.sortOrder }),
      }),
    );
  }

  // The cutting and packaging rules.

  @Post('cutting-packaging-incompatibilities')
  @ApiOperation({
    summary: 'Forbid a cutting style with a packaging',
    description: 'CONFLICT when the rule exists already.',
  })
  @ApiCreatedResponse({ type: CuttingPackagingIncompatibilityResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.CONFLICT,
    ...ADMIN_AUTH_ERRORS,
  )
  async createIncompatibility(
    @Body() body: CreateCuttingPackagingIncompatibilityDto,
  ): Promise<CuttingPackagingIncompatibilityResponseDto> {
    return toIncompatibilityResponse(
      await this.createRule.execute(body.cuttingStyleId, body.packaging),
    );
  }

  @Get('cutting-packaging-incompatibilities')
  @ApiOperation({ summary: 'The cutting and packaging rules, newest first' })
  @ApiOkResponse({ type: CuttingPackagingIncompatibilityPageResponseDto })
  @ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ...ADMIN_AUTH_ERRORS)
  async listIncompatibilities(
    @Query() query: PageQueryDto,
  ): Promise<CuttingPackagingIncompatibilityPageResponseDto> {
    const page = await this.listRules.execute(toPageRequest(query));
    return {
      items: page.items.map(toIncompatibilityResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Delete('cutting-packaging-incompatibilities/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a cutting and packaging rule' })
  @ApiNoContentResponse({ description: 'Removed.' })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ...ADMIN_AUTH_ERRORS,
  )
  async deleteIncompatibility(@Param() params: IdParamDto): Promise<void> {
    await this.deleteRule.execute(params.id);
  }

  // Products of every vendor, and their review.

  @Get('products')
  @ApiOperation({
    summary: 'Products of every vendor, newest first',
    description: 'status=pending_review is the review queue.',
  })
  @ApiOkResponse({ type: ProductCardPageResponseDto })
  @ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ...ADMIN_AUTH_ERRORS)
  async listAllProducts(
    @Query() query: AdminListProductsQueryDto,
  ): Promise<ProductCardPageResponseDto> {
    const page = await this.listProducts.execute(
      { kind: 'any' },
      {
        ...(query.status === undefined ? {} : { status: query.status }),
        ...(query.vendorId === undefined ? {} : { vendorId: query.vendorId }),
      },
      toPageRequest(query),
    );
    return {
      items: page.items.map(toProductCardResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Get('products/:id')
  @ApiOperation({
    summary: 'One product of any vendor, with its latest change request',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ...ADMIN_AUTH_ERRORS,
  )
  async readProduct(@Param() params: IdParamDto): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.getProduct.execute({ kind: 'any' }, params.id),
    );
  }

  @Post('products/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve a product under review: it is published',
    description: 'PRODUCT_NOT_EDITABLE unless it is under review.',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ...ADMIN_AUTH_ERRORS,
  )
  async approve(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.approveProduct.execute({
        reviewerId: user.userId,
        productId: params.id,
      }),
    );
  }

  @Post('products/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a product under review with a reason',
    description:
      'The vendor sees the reason, edits the product and submits it again.',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ...ADMIN_AUTH_ERRORS,
  )
  async reject(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: ReasonDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.rejectProduct.execute({
        reviewerId: user.userId,
        productId: params.id,
        reason: body.reason,
      }),
    );
  }

  @Get('product-change-requests')
  @ApiOperation({
    summary: 'Pending change requests on published products, newest first',
    description:
      'Each with the proposed content, its images with their URLs. The live product beside it: GET admin/products/:id.',
  })
  @ApiOkResponse({ type: ProductChangeRequestPageResponseDto })
  @ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ...ADMIN_AUTH_ERRORS)
  async listPendingChanges(
    @Query() query: PageQueryDto,
  ): Promise<ProductChangeRequestPageResponseDto> {
    const { page, imageUrls } = await this.listChangeRequests.execute(
      toPageRequest(query),
    );
    return {
      items: page.items.map((request) =>
        toChangeRequestResponse(request, imageUrls),
      ),
      nextCursor: toNextCursor(page),
    };
  }

  @Post('product-change-requests/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve a change request: it becomes the live product',
    description:
      'Existing sizes and cuttings keep their live prices. NOT_FOUND unless the request is pending.',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ...ADMIN_AUTH_ERRORS,
  )
  async approveChange(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.approveChangeRequest.execute({
        reviewerId: user.userId,
        requestId: params.id,
      }),
    );
  }

  @Post('product-change-requests/:id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Reject a change request with a reason',
    description: 'The live product is unchanged; the vendor sees the reason.',
  })
  @ApiNoContentResponse({ description: 'Rejected.' })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.TRANSACTION_CONFLICT,
    ...ADMIN_AUTH_ERRORS,
  )
  async rejectChange(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: ReasonDto,
  ): Promise<void> {
    await this.rejectChangeRequest.execute({
      reviewerId: user.userId,
      requestId: params.id,
      reason: body.reason,
    });
  }

  // JAZLA's own products: written and published by admins, no review.

  @Post('products')
  @ApiOperation({
    summary: 'Create a JAZLA product (a draft of the platform vendor)',
    description:
      'Upload each image first (POST /v1/admin/media/uploads, purpose catalog.product-image) and confirm it. NOT_FOUND (PLATFORM_VENDOR_MISSING) before `pnpm vendor:create-platform`.',
  })
  @ApiCreatedResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ...PRODUCT_CONTENT_ERRORS,
    ErrorCode.NOT_FOUND,
    ...ADMIN_AUTH_ERRORS,
  )
  async createPlatformProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.createProduct.execute({
        scope: PLATFORM_SCOPE,
        actorId: user.userId,
        fulfilment: body.fulfilment,
        content: toProductContent(body),
      }),
    );
  }

  @Put('products/:id')
  @ApiOperation({
    summary: 'Replace a JAZLA product’s content',
    description:
      'Applies at once, also when published (audited). Existing sizes and cuttings keep their live prices here (change them with PATCH …/prices); a published product must meet the submission rules. Another vendor’s product is NOT_FOUND.',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ...PRODUCT_CONTENT_ERRORS,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.PRODUCT_NOT_SUBMITTABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ...ADMIN_AUTH_ERRORS,
  )
  async updatePlatformProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: ProductContentDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.updateContent.execute({
        scope: PLATFORM_SCOPE,
        actorId: user.userId,
        productId: params.id,
        content: toProductContent(body),
      }),
    );
  }

  @Post('products/:id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish a JAZLA draft directly',
    description:
      'PRODUCT_NOT_SUBMITTABLE without a size or an image, or with incompatible options. Another vendor’s product is NOT_FOUND.',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.PRODUCT_NOT_SUBMITTABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ...ADMIN_AUTH_ERRORS,
  )
  async publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.publishProduct.execute({
        actorId: user.userId,
        productId: params.id,
      }),
    );
  }

  @Patch('products/:id/availability')
  @ApiOperation({ summary: 'Switch a JAZLA product on or off, at once' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async platformAvailability(
    @Param() params: IdParamDto,
    @Body() body: SetProductAvailabilityDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.setAvailability.execute({
        scope: PLATFORM_SCOPE,
        productId: params.id,
        isAvailable: body.isAvailable,
      }),
    );
  }

  @Patch('products/:id/fulfilment')
  @ApiOperation({
    summary: 'Set delivery, pickup or both on a JAZLA product, at once',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async platformFulfilment(
    @Param() params: IdParamDto,
    @Body() body: SetProductFulfilmentDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.setFulfilment.execute({
        scope: PLATFORM_SCOPE,
        productId: params.id,
        fulfilment: body.fulfilment,
      }),
    );
  }

  @Patch('products/:id/prices')
  @ApiOperation({
    summary: 'Change a JAZLA product’s prices, at once',
    description: 'Each change is recorded in the audit log.',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ...ADMIN_AUTH_ERRORS,
  )
  async platformPrices(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: ChangeProductPricesDto,
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.changePrices.execute({
        scope: PLATFORM_SCOPE,
        actorId: user.userId,
        productId: params.id,
        changes: toPriceChanges(body),
      }),
    );
  }
}
