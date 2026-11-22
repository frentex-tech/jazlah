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
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { ListAdminOrdersQueryDto } from '../dto/list-admin-orders-query.dto';
import { OrderPageResponseDto } from '../dto/order-page-response.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { TransitionOrderDto } from '../dto/transition-order.dto';

/**
 * Orders as admins see them (ORD-API-2, ORD-API-3). Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin')
export class AdminOrdersController {
  @Get('orders')
  @ApiTags(API_TAGS.adminOrders.name)
  @ApiOperation({
    operationId: 'adminListOrders',
    summary: 'Orders',
    description:
      'Admin dashboard, orders list: every order, with a vendor filter, newest first. An order past `expiresAt` and still unpaid is cancelled when read (workers are off on staging), so the answer is always current. Until ORD-API-3 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: OrderPageResponseDto,
    description: 'One page of orders.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  listOrders(
    @Query() query: ListAdminOrdersQueryDto,
  ): Promise<OrderPageResponseDto> {
    return notImplemented('ORD-API-3', query);
  }

  @Get('orders/:id')
  @ApiTags(API_TAGS.adminOrders.name)
  @ApiOperation({
    operationId: 'adminGetOrder',
    summary: 'One order',
    description:
      'Admin dashboard, order detail, with `allowedTransitions` for the caller. An order past `expiresAt` and still unpaid is cancelled when read (workers are off on staging), so the answer is always current. NOT_FOUND for an unknown order. Until ORD-API-3 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: OrderResponseDto,
    description: 'The order.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  getOrder(@Param() params: IdParamDto): Promise<OrderResponseDto> {
    return notImplemented('ORD-API-3', params);
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
