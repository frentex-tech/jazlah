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
import { ADMIN_AUTH_ERRORS } from '@common/decorators/admin-auth-errors.constants';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { notImplemented } from '@common/errors/not-implemented';
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { FindAdminOrderUseCase } from '../../application/find-admin-order.use-case';
import { ListAdminOrdersUseCase } from '../../application/list-admin-orders.use-case';
import { ListAdminOrdersQueryDto } from '../dto/list-admin-orders-query.dto';
import { OrderPageResponseDto } from '../dto/order-page-response.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { TransitionOrderDto } from '../dto/transition-order.dto';
import { toOrderResponse } from '../to-order-response';
import { toOrderSummaryResponse } from '../to-order-summary-response';

/**
 * Orders as admins see them. The list and the detail are live (ORD-API-3); the transition answers NOT_IMPLEMENTED (501) until ORD-API-2 lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin')
export class AdminOrdersController {
  constructor(
    private readonly listOrders: ListAdminOrdersUseCase,
    private readonly findOrder: FindAdminOrderUseCase,
  ) {}

  @Get('orders')
  @ApiTags(API_TAGS.adminOrders.name)
  @ApiOperation({
    operationId: 'adminListOrders',
    summary: 'Orders',
    description:
      'Admin dashboard, orders list: every order, with a vendor filter, newest first. An order past `expiresAt` and still unpaid is cancelled when read (workers are off on staging), so the answer is always current; capacity, coupon use and wallet reads treat such orders as already released.',
  })
  @ApiOkResponse({
    type: OrderPageResponseDto,
    description: 'One page of orders.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async list(
    @Query() query: ListAdminOrdersQueryDto,
  ): Promise<OrderPageResponseDto> {
    const page = await this.listOrders.execute(
      {
        vendorId: query.vendorId,
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
  @ApiTags(API_TAGS.adminOrders.name)
  @ApiOperation({
    operationId: 'adminGetOrder',
    summary: 'One order',
    description:
      'Admin dashboard, order detail, with `allowedTransitions` for the caller. An order past `expiresAt` and still unpaid is cancelled when read (workers are off on staging), so the answer is always current; capacity, coupon use and wallet reads treat such orders as already released. NOT_FOUND for an unknown order.',
  })
  @ApiOkResponse({
    type: OrderResponseDto,
    description: 'The order.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async getOrder(@Param() params: IdParamDto): Promise<OrderResponseDto> {
    return toOrderResponse(await this.findOrder.execute(params.id));
  }

  @Post('orders/:id/transition')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.adminOrders.name)
  @ApiOperation({
    operationId: 'adminTransitionOrder',
    summary: 'Move an order to another status',
    description:
      'Admin dashboard, order actions. Moves the order along its state machine: `to` must be one of the order’s `allowedTransitions` for this caller, else ORDER_TRANSITION_NOT_ALLOWED (`details.from`, `details.to`). Recorded in the history with the note; every move is published to the dashboards and the customer. Rejecting a cash-on-delivery order under review is `{ to: "cancelled", note: <reason> }`. NOT_FOUND for an unknown order. Until ORD-API-2 lands: NOT_IMPLEMENTED.',
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
    ...ADMIN_AUTH_ERRORS,
  )
  transitionOrder(
    @Param() params: IdParamDto,
    @Body() body: TransitionOrderDto,
  ): Promise<OrderResponseDto> {
    return notImplemented('ORD-API-2', params, body);
  }
}
