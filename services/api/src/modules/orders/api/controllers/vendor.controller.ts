import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { notImplemented } from '@common/errors/not-implemented';
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { FindVendorOrderUseCase } from '../../application/find-vendor-order.use-case';
import { ListVendorOrdersUseCase } from '../../application/list-vendor-orders.use-case';
import { ListVendorOrdersQueryDto } from '../dto/list-vendor-orders-query.dto';
import { OrderPageResponseDto } from '../dto/order-page-response.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { TransitionOrderDto } from '../dto/transition-order.dto';
import { toOrderResponse } from '../to-order-response';
import { toOrderSummaryResponse } from '../to-order-summary-response';

/**
 * Orders as the vendor sees them. The list and the detail are live (ORD-API-3); the transition answers NOT_IMPLEMENTED (501) until ORD-API-2 lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('vendor')
export class VendorOrdersController {
  constructor(
    private readonly listOrders: ListVendorOrdersUseCase,
    private readonly findOrder: FindVendorOrderUseCase,
  ) {}

  @Get('orders')
  @ApiTags(API_TAGS.vendorOrders.name)
  @ApiOperation({
    operationId: 'vendorListOrders',
    summary: 'Orders',
    description:
      'Vendor dashboard, orders list: the vendor’s own orders, newest first. An order past `expiresAt` and still unpaid is cancelled when read (workers are off on staging), so the answer is always current; capacity, coupon use and wallet reads treat such orders as already released.',
  })
  @ApiOkResponse({
    type: OrderPageResponseDto,
    description: 'One page of orders.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...VENDOR_AUTH_ERRORS,
  )
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListVendorOrdersQueryDto,
  ): Promise<OrderPageResponseDto> {
    const page = await this.listOrders.execute(
      organisationOf(user),
      {
        status: query.status,
        paymentMethod: query.paymentMethod,
        fulfilmentDate: query.fulfilmentDate,
        search: query.q,
      },
      toPageRequest(query),
    );
    return {
      items: page.items.map(toOrderSummaryResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Get('orders/:id')
  @ApiTags(API_TAGS.vendorOrders.name)
  @ApiOperation({
    operationId: 'vendorGetOrder',
    summary: 'One order',
    description:
      'Vendor dashboard, order detail, with `allowedTransitions` for the caller. An order past `expiresAt` and still unpaid is cancelled when read (workers are off on staging), so the answer is always current; capacity, coupon use and wallet reads treat such orders as already released. NOT_FOUND for an unknown order or another vendor’s.',
  })
  @ApiOkResponse({
    type: OrderResponseDto,
    description: 'The order.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...VENDOR_AUTH_ERRORS,
  )
  async getOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<OrderResponseDto> {
    return toOrderResponse(
      await this.findOrder.execute(organisationOf(user), params.id),
    );
  }

  @Post('orders/:id/transition')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.vendorOrders.name)
  @ApiOperation({
    operationId: 'vendorTransitionOrder',
    summary: 'Move an order to another status',
    description:
      'Vendor dashboard, order actions. Moves the order along its state machine: `to` must be one of the order’s `allowedTransitions` for this caller, else ORDER_TRANSITION_NOT_ALLOWED (`details.from`, `details.to`). Recorded in the history with the note; every move is published to the dashboards and the customer. NOT_FOUND for an unknown order or another vendor’s. Until ORD-API-2 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: OrderResponseDto,
    description: 'The order after the move.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ORDER_TRANSITION_NOT_ALLOWED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...VENDOR_AUTH_ERRORS,
  )
  transitionOrder(
    @Param() params: IdParamDto,
    @Body() body: TransitionOrderDto,
  ): Promise<OrderResponseDto> {
    return notImplemented('ORD-API-2', params, body);
  }
}
