import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CUSTOMER_AUTH_ERRORS } from '@common/decorators/customer-auth-errors.constants';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { notImplemented } from '@common/errors/not-implemented';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { ListCustomerOrdersQueryDto } from '../dto/list-customer-orders-query.dto';
import { OrderPageResponseDto } from '../dto/order-page-response.dto';
import { OrderResponseDto } from '../dto/order-response.dto';

/**
 * The customer’s orders (ORD-API-3). Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer')
export class CustomerOrdersController {
  @Get('orders')
  @ApiTags(API_TAGS.customerOrders.name)
  @ApiOperation({
    operationId: 'customerListOrders',
    summary: 'My orders',
    description:
      'Customer app, orders tab: newest first, `current` or `past`. An order past `expiresAt` and still unpaid is cancelled when read (workers are off on staging), so the answer is always current; capacity, coupon use and wallet reads treat such orders as already released. Until ORD-API-3 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: OrderPageResponseDto,
    description: 'One page of orders.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  listOrders(
    @Query() query: ListCustomerOrdersQueryDto,
  ): Promise<OrderPageResponseDto> {
    return notImplemented('ORD-API-3', query);
  }

  @Get('orders/:id')
  @ApiTags(API_TAGS.customerOrders.name)
  @ApiOperation({
    operationId: 'customerGetOrder',
    summary: 'One of my orders',
    description:
      'Customer app, order detail, and the payment result: poll it after the payment page closes (every 2 s, up to 60 s): paid once the status is neither `pending_payment` nor `cancelled`. Carries the store’s phone and location. Cancelling is Sprint 4 (CAN-API-1). An order past `expiresAt` and still unpaid is cancelled when read (workers are off on staging), so the answer is always current; capacity, coupon use and wallet reads treat such orders as already released. NOT_FOUND for another customer’s order. Until ORD-API-3 lands: NOT_IMPLEMENTED.',
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
    ...CUSTOMER_AUTH_ERRORS,
  )
  getOrder(@Param() params: IdParamDto): Promise<OrderResponseDto> {
    return notImplemented('ORD-API-3', params);
  }
}
