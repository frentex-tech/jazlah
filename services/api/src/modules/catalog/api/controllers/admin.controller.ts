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
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
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
  @ApiTags(API_TAGS.adminCatalogLists.name)
  @ApiOperation({
    operationId: 'adminCreateCatalogListEntry',
    summary: 'Add an entry to a list (it starts active)',
    description:
      'Admin dashboard, catalog settings. Adds an entry, with its Arabic and English name, to one of the lists products are built from: `categories`, `meat-types`, `cutting-styles` or `exclusion-items` (the "without" items a customer can ask to leave out). It starts active, so vendors can choose it at once. ' +
      'Only a category takes a display order (`sortOrder`, lower first, 0 when left out); on another list it is refused with VALIDATION_FAILED `isOrderedList`. Only a category takes an image (`imageMediaId`: upload it first with POST /v1/admin/media/uploads, purpose `catalog.category-image`, then confirm it; MEDIA_NOT_FOUND for another user’s or another purpose’s file, MEDIA_NOT_READY before confirmation); on another list VALIDATION_FAILED `isCategoryList`. Names need not be unique.',
  })
  @ApiCreatedResponse({
    type: ReferenceItemResponseDto,
    description: 'The new entry, active.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.MEDIA_NOT_FOUND,
    ErrorCode.MEDIA_NOT_READY,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async createListItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: ReferenceListParamDto,
    @Body() body: CreateReferenceItemDto,
  ): Promise<ReferenceItemResponseDto> {
    return toReferenceItemResponse(
      await this.createItem.execute(
        toReferenceList(params.list),
        {
          name: body.name,
          ...(body.sortOrder === undefined
            ? {}
            : { sortOrder: body.sortOrder }),
          ...(body.imageMediaId === undefined
            ? {}
            : { imageMediaId: body.imageMediaId }),
        },
        user.userId,
      ),
    );
  }

  @Get('lists/:list')
  @ApiTags(API_TAGS.adminCatalogLists.name)
  @ApiOperation({
    operationId: 'adminListCatalogListEntries',
    summary: 'The entries of a list, newest first',
    description:
      'Admin dashboard, catalog settings, and the pickers of the JAZLA product form. The entries of one list (`categories`, `meat-types`, `cutting-styles`, `exclusion-items`), active and inactive, newest first; `isActive` keeps only one kind. Keyset paging: send `nextCursor` back as `cursor` until it is null; no total count. The public order of categories is their `sortOrder`, not this order.',
  })
  @ApiOkResponse({
    type: ReferenceItemPageResponseDto,
    description: 'One page of the list’s entries.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
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
  @ApiTags(API_TAGS.adminCatalogLists.name)
  @ApiOperation({
    operationId: 'adminUpdateCatalogListEntry',
    summary: 'Rename an entry, switch it on or off, or reorder a category',
    description:
      'Admin dashboard, catalog settings. Changes only the fields sent: the name (both languages together), `isActive`, and for a category `sortOrder` (the public order, lower first; on another list VALIDATION_FAILED `isOrderedList`) and `imageMediaId` (a confirmed `catalog.category-image` upload of the signed-in admin, MEDIA_NOT_FOUND or MEDIA_NOT_READY otherwise; null removes the image; on another list VALIDATION_FAILED `isCategoryList`). Applies at once. Entries are never deleted: switch one off instead. ' +
      'An inactive entry can no longer be chosen for a product (VALIDATION_FAILED on the product form); products already using it keep it. An inactive category also hides all its products from the public catalog at once, until it is switched on again. ' +
      'NOT_FOUND for an id that is not an entry of this list.',
  })
  @ApiOkResponse({
    type: ReferenceItemResponseDto,
    description: 'The entry as saved.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.MEDIA_NOT_FOUND,
    ErrorCode.MEDIA_NOT_READY,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async updateListItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: ReferenceItemParamDto,
    @Body() body: UpdateReferenceItemDto,
  ): Promise<ReferenceItemResponseDto> {
    return toReferenceItemResponse(
      await this.updateItem.execute(
        toReferenceList(params.list),
        params.id,
        {
          ...(body.name === undefined ? {} : { name: body.name }),
          ...(body.isActive === undefined ? {} : { isActive: body.isActive }),
          ...(body.sortOrder === undefined
            ? {}
            : { sortOrder: body.sortOrder }),
          ...(body.imageMediaId === undefined
            ? {}
            : { imageMediaId: body.imageMediaId }),
        },
        user.userId,
      ),
    );
  }

  // The cutting and packaging rules.

  @Post('cutting-packaging-incompatibilities')
  @ApiTags(API_TAGS.adminCatalogLists.name)
  @ApiOperation({
    operationId: 'adminCreateCuttingPackagingIncompatibility',
    summary: 'Forbid a cutting style with a packaging',
    description:
      'Admin dashboard, catalog settings. Adds a global rule: products may not offer this cutting style together with this packaging. Products already published keep their options; the rule applies to every later submission, publication and change request, refused with PRODUCT_NOT_SUBMITTABLE (INCOMPATIBLE_CUTTING_PACKAGING) while they offer the pair. ' +
      'Errors: VALIDATION_FAILED `isActiveCuttingStyle` when the cutting style is not an active entry; CONFLICT when the same rule exists already.',
  })
  @ApiCreatedResponse({
    type: CuttingPackagingIncompatibilityResponseDto,
    description: 'The new rule.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.adminCatalogLists.name)
  @ApiOperation({
    operationId: 'adminListCuttingPackagingIncompatibilities',
    summary: 'The cutting and packaging rules, newest first',
    description:
      'Admin dashboard, catalog settings. Every cutting style and packaging pair products may not combine, newest first, by id (the cutting style names come from GET /v1/admin/lists/cutting-styles). Keyset paging: send `nextCursor` back as `cursor` until it is null; no total count.',
  })
  @ApiOkResponse({
    type: CuttingPackagingIncompatibilityPageResponseDto,
    description: 'One page of rules.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
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
  @ApiTags(API_TAGS.adminCatalogLists.name)
  @ApiOperation({
    operationId: 'adminDeleteCuttingPackagingIncompatibility',
    summary: 'Remove a cutting and packaging rule',
    description:
      'Admin dashboard, catalog settings. Deletes the rule at once: products may offer the pair again from their next submission or edit. NOT_FOUND for an unknown id, also when it was removed already.',
  })
  @ApiNoContentResponse({ description: 'The rule was removed; no body.' })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async deleteIncompatibility(@Param() params: IdParamDto): Promise<void> {
    await this.deleteRule.execute(params.id);
  }

  // Products of every vendor, and their review.

  @Get('products')
  @ApiTags(API_TAGS.adminProducts.name)
  @ApiOperation({
    operationId: 'adminListProducts',
    summary: 'Products of every vendor, newest first',
    description:
      'Admin dashboard, products and the review queue. Products of every vendor (JAZLA’s own included) in every status, newest first, optionally of one `status` and one `vendorId`. `status=pending_review` is the review queue of new products (approve or reject them with POST …/{id}/approve and …/{id}/reject); edits of published products wait in GET /v1/admin/product-change-requests instead. Keyset paging: send `nextCursor` back as `cursor` until it is null; no total count.',
  })
  @ApiOkResponse({
    type: ProductCardPageResponseDto,
    description: 'One page of products as cards.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
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
  @ApiTags(API_TAGS.adminProducts.name)
  @ApiOperation({
    operationId: 'adminGetProduct',
    summary: 'One product of any vendor, with its latest change request',
    description:
      'Admin dashboard, product page and review screens. Any vendor’s product as it is live (or as the draft stands), with its status, review fields and latest change request (the pending one, or the last decided one; null for none). Open it beside a change request to compare the live product with the proposed content. NOT_FOUND for an unknown id.',
  })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'The product with its latest change request.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async readProduct(@Param() params: IdParamDto): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.getProduct.execute({ kind: 'any' }, params.id),
    );
  }

  @Post('products/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.adminProducts.name)
  @ApiOperation({
    operationId: 'adminApproveProduct',
    summary: 'Approve a product under review: it is published',
    description:
      'Admin dashboard, review queue. Moves a `pending_review` product to `published`: customers see it at once if it is available, its vendor active and its category active. Later content edits by the vendor go through change requests. Recorded in the audit log. No body. ' +
      'Errors: PRODUCT_NOT_EDITABLE when the product is not under review, also when another admin decided first (`details.status`; reload the queue); NOT_FOUND for an unknown id.',
  })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'The product, now `published`.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.adminProducts.name)
  @ApiOperation({
    operationId: 'adminRejectProduct',
    summary: 'Reject a product under review with a reason',
    description:
      'Admin dashboard, review queue. Moves a `pending_review` product to `rejected` with the reason the vendor reads on the product (`rejectionReason`); the vendor edits it and submits it again. Recorded in the audit log. ' +
      'Errors: PRODUCT_NOT_EDITABLE when the product is not under review, also when another admin decided first (`details.status`; reload the queue); NOT_FOUND for an unknown id.',
  })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'The product, now `rejected` with the reason.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.adminProductChangeRequests.name)
  @ApiOperation({
    operationId: 'adminListProductChangeRequests',
    summary: 'Pending change requests on published products, newest first',
    description:
      'Admin dashboard, the review queue of edits. A vendor’s content edit of a published product does not change it: it becomes a change request, `pending` here until an admin approves it (its content becomes the live product) or rejects it with a reason (the live product stays). When the vendor edits again before a decision, the pending request is closed as `superseded` and a new one takes its place, so a product has at most one pending request and a request’s content never changes. ' +
      'Each item carries the proposed content (ids, with image URLs; prices in halalas, VAT included); compare it with the live product from GET /v1/admin/products/{id}. Only pending requests, newest first. Keyset paging: send `nextCursor` back as `cursor` until it is null; no total count.',
  })
  @ApiOkResponse({
    type: ProductChangeRequestPageResponseDto,
    description: 'One page of pending change requests.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
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
  @ApiTags(API_TAGS.adminProductChangeRequests.name)
  @ApiOperation({
    operationId: 'adminApproveProductChangeRequest',
    summary: 'Approve a change request: it becomes the live product',
    description:
      'Admin dashboard, review queue of edits. The request becomes `approved` and its content replaces the live product at once, exactly as shown in the queue (a request never changes). Sizes, cutting styles and packagings the product already has keep their live prices (prices change only through the prices endpoints); new ones take the prices of the request. The product stays `published`. Recorded in the audit log. No body. ' +
      'Errors: PRODUCT_CHANGE_REQUEST_SUPERSEDED when the vendor has edited again since: reload, the newer request is in the queue; NOT_FOUND for an unknown request or one already approved or rejected; PRODUCT_NOT_EDITABLE if the product is no longer published.',
  })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'The live product with the approved content.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_CHANGE_REQUEST_SUPERSEDED,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.adminProductChangeRequests.name)
  @ApiOperation({
    operationId: 'adminRejectProductChangeRequest',
    summary: 'Reject a change request with a reason',
    description:
      'Admin dashboard, review queue of edits. The request becomes `rejected` with the reason the vendor reads on the product’s `changeRequest`; the live product is unchanged and the proposed content is discarded. Recorded in the audit log. ' +
      'Errors: PRODUCT_CHANGE_REQUEST_SUPERSEDED when the vendor has edited again since: reload, the newer request is in the queue; NOT_FOUND for an unknown request or one already approved or rejected.',
  })
  @ApiNoContentResponse({
    description: 'The change request was rejected; no body.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_CHANGE_REQUEST_SUPERSEDED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.adminProducts.name)
  @ApiOperation({
    operationId: 'adminCreatePlatformProduct',
    summary: 'Create a JAZLA product (a draft of the platform vendor)',
    description:
      'Admin dashboard, JAZLA products, new product form. JAZLA sells its own products through the platform vendor, and admins write them directly, with no review. Creates a `draft` of the platform vendor, available, with the content and fulfilment sent; publish it with POST …/{id}/publish. ' +
      'Upload each image first (POST /v1/admin/media/uploads with purpose `catalog.product-image`, then POST /v1/admin/media/{id}/confirm) and send the media ids in display order: the first is the cover. A draft may be incomplete. Prices are integer halalas, VAT included. ' +
      'Errors: VALIDATION_FAILED also for an inactive category, meat type, cutting style or "without" item, or a repeat; MEDIA_NOT_FOUND / MEDIA_NOT_READY for an image not uploaded and confirmed by this admin (`details.mediaId`); NOT_FOUND with `details.reason` PLATFORM_VENDOR_MISSING while JAZLA’s own vendor has not been set up.',
  })
  @ApiCreatedResponse({
    type: ProductResponseDto,
    description: 'The new JAZLA draft product.',
  })
  @ApiErrorResponses(
    ...PRODUCT_CONTENT_ERRORS,
    ErrorCode.NOT_FOUND,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.adminProducts.name)
  @ApiOperation({
    operationId: 'adminUpdatePlatformProductContent',
    summary: 'Replace a JAZLA product’s content',
    description:
      'Admin dashboard, JAZLA products, edit form. Replaces the whole content of a platform vendor product (send every field, lists in display order); availability, fulfilment and prices have their own endpoints. Applies at once, also when published: no change request. An edit of a published product is recorded in the audit log and must meet the submission rules (at least one size and one image, no cutting style offered with a packaging it cannot be combined with). ' +
      'Keep an existing size by sending its `id`; a size left out is removed; a size without `id` is new. Existing sizes, cutting styles and packagings must carry their current prices (VALIDATION_FAILED `isLivePrice`): change them with PATCH …/{id}/prices. ' +
      'Errors: VALIDATION_FAILED also for an inactive reference, a size id not of this product or a repeat; MEDIA_NOT_FOUND / MEDIA_NOT_READY for a new image not uploaded and confirmed by this admin; PRODUCT_NOT_SUBMITTABLE (published only) with `details.reasons` and `details.pairs`; PRODUCT_NOT_EDITABLE for a product under review; ' +
      'NOT_FOUND for an unknown id or a product of another vendor (admins act on other vendors’ products only through review), and with `details.reason` PLATFORM_VENDOR_MISSING while JAZLA’s own vendor has not been set up.',
  })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'The product with the new content.',
  })
  @ApiErrorResponses(
    ...PRODUCT_CONTENT_ERRORS,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.PRODUCT_NOT_SUBMITTABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.adminProducts.name)
  @ApiOperation({
    operationId: 'adminPublishPlatformProduct',
    summary: 'Publish a JAZLA draft directly',
    description:
      'Admin dashboard, JAZLA products. Moves a platform vendor `draft` straight to `published`, without review; customers see it at once if it is available and its category active. Recorded in the audit log. No body. ' +
      'Errors: PRODUCT_NOT_SUBMITTABLE without a size or an image, or with a cutting style offered with a packaging it cannot be combined with (`details.reasons`, `details.pairs`); PRODUCT_NOT_EDITABLE when the product is not a draft (`details.status`); ' +
      'NOT_FOUND for an unknown id or a product of another vendor (admins act on other vendors’ products only through review), and with `details.reason` PLATFORM_VENDOR_MISSING while JAZLA’s own vendor has not been set up.',
  })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'The product, now `published`.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.PRODUCT_NOT_EDITABLE,
    ErrorCode.PRODUCT_NOT_SUBMITTABLE,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
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
  @ApiTags(API_TAGS.adminProducts.name)
  @ApiOperation({
    operationId: 'adminSetPlatformProductAvailability',
    summary: 'Switch a JAZLA product on or off, at once',
    description:
      'Admin dashboard, JAZLA products, the availability switch. Applies at once, also on a published product: an unavailable product leaves the public catalog until it is switched on again. ' +
      'Errors: PRODUCT_NOT_EDITABLE for a product under review (`details.status`); ' +
      'NOT_FOUND for an unknown id or a product of another vendor (admins act on other vendors’ products only through review), and with `details.reason` PLATFORM_VENDOR_MISSING while JAZLA’s own vendor has not been set up.',
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
  @ApiTags(API_TAGS.adminProducts.name)
  @ApiOperation({
    operationId: 'adminSetPlatformProductFulfilment',
    summary: 'Set delivery, pickup or both on a JAZLA product, at once',
    description:
      'Admin dashboard, JAZLA products. Sets how the product reaches the customer: `delivery`, `pickup` or `both`. Applies at once, also on a published product. ' +
      'Errors: PRODUCT_NOT_EDITABLE for a product under review (`details.status`); ' +
      'NOT_FOUND for an unknown id or a product of another vendor (admins act on other vendors’ products only through review), and with `details.reason` PLATFORM_VENDOR_MISSING while JAZLA’s own vendor has not been set up.',
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
  @ApiTags(API_TAGS.adminProducts.name)
  @ApiOperation({
    operationId: 'adminChangePlatformProductPrices',
    summary: 'Change a JAZLA product’s prices, at once',
    description:
      'Admin dashboard, JAZLA products, prices form. Sets new prices for some of the product’s existing sizes (by size id), cutting styles (by cutting style id) and packagings (by packaging); the others keep theirs. Integer halalas, VAT included. Applies at once, also on a published product; the lowest price is updated and each price that actually changed is recorded in the audit log. ' +
      'Errors: VALIDATION_FAILED for a size, cutting style or packaging that is not the product’s (`isSizeOfProduct`, `isCuttingOfProduct`, `isPackagingOfProduct`) or named twice (`isNotRepeated`); PRODUCT_NOT_EDITABLE for a product under review (`details.status`); ' +
      'NOT_FOUND for an unknown id or a product of another vendor (admins act on other vendors’ products only through review), and with `details.reason` PLATFORM_VENDOR_MISSING while JAZLA’s own vendor has not been set up.',
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
