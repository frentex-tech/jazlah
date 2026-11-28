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
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { FindAdminOrderUseCase } from '../../application/find-admin-order.use-case';
import { ListAdminOrdersUseCase } from '../../application/list-admin-orders.use-case';
import { TransitionOrderUseCase } from '../../application/transition-order.use-case';
import { ListAdminOrdersQueryDto } from '../dto/list-admin-orders-query.dto';
import { OrderPageResponseDto } from '../dto/order-page-response.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { TransitionOrderDto } from '../dto/transition-order.dto';
import { toOrderResponse } from '../to-order-response';
import { toOrderSummaryResponse } from '../to-order-summary-response';

/**
 * Orders as admins see them, including the Sprint 3 order state transitions.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin')
export class AdminOrdersController {
  constructor(
    private readonly listOrders: ListAdminOrdersUseCase,
    private readonly findOrder: FindAdminOrderUseCase,
    private readonly moveOrder: TransitionOrderUseCase,
  ) {}

  @Get('orders')
  @ApiTags(API_TAGS.adminOrders.name)
  @ApiOperation({
    operationId: 'adminListOrders',
    summary: 'Orders',
    description:
      'Admin dashboard, orders list: every order, with a vendor filter, newest first. Status is the value last committed by the order state machine. The payment timeout is deferred to a later payment task.',
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
      'Admin dashboard, order detail, with `allowedTransitions` for this admin. Status is the value last committed by the state machine. NOT_FOUND for an unknown order.',
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
    return toOrderResponse(await this.findOrder.execute(params.id), 'admin');
  }

  @Post('orders/:id/transition')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.adminOrders.name)
  @ApiOperation({
    operationId: 'adminTransitionOrder',
    summary: 'Move an order to another status',
    description:
      'Admin dashboard, order actions. Moves the order along its state machine: `to` must be one of the order’s `allowedTransitions`, else ORDER_TRANSITION_NOT_ALLOWED (`details.from`, `details.to`). The move and one history row are saved together and published as `order.status.changed` after commit. Rejecting a COD order under review is `{ to: "cancelled", note: <reason> }`. Admins alone can retry a failed delivery or return it. NOT_FOUND for an unknown order.',
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
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async transitionOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: TransitionOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.moveOrder.execute(
      params.id,
      body.to,
      { type: 'admin', id: user.userId },
      body.note ?? null,
    );
    return toOrderResponse(order, 'admin');
  }
}
