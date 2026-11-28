import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { CUSTOMER_AUTH_ERRORS } from '@common/decorators/customer-auth-errors.constants';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { FindCustomerOrderUseCase } from '../../application/find-customer-order.use-case';
import { ListCustomerOrdersUseCase } from '../../application/list-customer-orders.use-case';
import { ListCustomerOrdersQueryDto } from '../dto/list-customer-orders-query.dto';
import { OrderPageResponseDto } from '../dto/order-page-response.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { toOrderResponse } from '../to-order-response';
import { toOrderSummaryResponse } from '../to-order-summary-response';

/**
 * The customer’s orders (ORD-API-3): the list and the detail, read from what was saved when each was placed.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer')
export class CustomerOrdersController {
  constructor(
    private readonly listOrders: ListCustomerOrdersUseCase,
    private readonly findOrder: FindCustomerOrderUseCase,
  ) {}

  @Get('orders')
  @ApiTags(API_TAGS.customerOrders.name)
  @ApiOperation({
    operationId: 'customerListOrders',
    summary: 'My orders',
    description:
      'Customer app, orders tab: newest first, `current` or `past`. Status is the value last committed by the order state machine; customers cannot move statuses in Sprint 3.',
  })
  @ApiOkResponse({
    type: OrderPageResponseDto,
    description: 'One page of orders.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListCustomerOrdersQueryDto,
  ): Promise<OrderPageResponseDto> {
    const page = await this.listOrders.execute(
      user.userId,
      query.scope,
      toPageRequest(query),
    );
    return {
      items: page.items.map(toOrderSummaryResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Get('orders/:id')
  @ApiTags(API_TAGS.customerOrders.name)
  @ApiOperation({
    operationId: 'customerGetOrder',
    summary: 'One of my orders',
    description:
      'Customer app, order detail, and the payment result: poll it after the payment page closes (every 2 s, up to 60 s): paid once the status is neither `pending_payment` nor `cancelled`. Carries the store’s phone and location. Customer cancellation is Sprint 4 (CAN-API-1). Payment timeout and expiry are deferred to a later payment task. NOT_FOUND for another customer’s order.',
  })
  @ApiOkResponse({
    type: OrderResponseDto,
    description: 'The order.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async getOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<OrderResponseDto> {
    return toOrderResponse(
      await this.findOrder.execute(user.userId, params.id),
      'customer',
    );
  }
}
