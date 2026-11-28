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
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { FindVendorOrderUseCase } from '../../application/find-vendor-order.use-case';
import { ListVendorOrdersUseCase } from '../../application/list-vendor-orders.use-case';
import { TransitionOrderUseCase } from '../../application/transition-order.use-case';
import { ListVendorOrdersQueryDto } from '../dto/list-vendor-orders-query.dto';
import { OrderPageResponseDto } from '../dto/order-page-response.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { TransitionOrderDto } from '../dto/transition-order.dto';
import { toOrderResponse } from '../to-order-response';
import { toOrderSummaryResponse } from '../to-order-summary-response';

/**
 * The vendor's own orders, the detail of an order, and its Sprint 3 state transitions.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('vendor')
export class VendorOrdersController {
  constructor(
    private readonly listOrders: ListVendorOrdersUseCase,
    private readonly findOrder: FindVendorOrderUseCase,
    private readonly moveOrder: TransitionOrderUseCase,
  ) {}

  @Get('orders')
  @ApiTags(API_TAGS.vendorOrders.name)
  @ApiOperation({
    operationId: 'vendorListOrders',
    summary: 'Orders',
    description:
      'Vendor dashboard, orders list: the vendor’s own orders, newest first. Status is the value last committed by the order state machine. The payment timeout is deferred to a later payment task.',
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
      'Vendor dashboard, order detail, with `allowedTransitions` for this vendor. Status is the value last committed by the state machine. NOT_FOUND for an unknown order or another vendor’s.',
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
      'vendor',
    );
  }

  @Post('orders/:id/transition')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.vendorOrders.name)
  @ApiOperation({
    operationId: 'vendorTransitionOrder',
    summary: 'Move an order to another status',
    description:
      'Vendor dashboard, the vendor of this order moves it along its state machine: `to` must be one of the order’s `allowedTransitions`, else ORDER_TRANSITION_NOT_ALLOWED (`details.from`, `details.to`). The move and one history row are saved together and published as `order.status.changed` after commit. A COD rejection is `{ to: "cancelled", note: <reason> }`. NOT_FOUND for an unknown order or another vendor’s.',
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
    ...VENDOR_AUTH_ERRORS,
  )
  async transitionOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: TransitionOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.moveOrder.execute(
      params.id,
      body.to,
      {
        type: 'vendor',
        id: user.userId,
        vendorId: organisationOf(user),
      },
      body.note ?? null,
    );
    return toOrderResponse(order, 'vendor');
  }
}
