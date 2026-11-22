import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CUSTOMER_AUTH_ERRORS } from '@common/decorators/customer-auth-errors.constants';
import { ErrorCode } from '@common/errors/error-code.enum';
import { notImplemented } from '@common/errors/not-implemented';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { CheckoutDayListResponseDto } from '../dto/checkout-day-list-response.dto';
import { ListCheckoutDaysQueryDto } from '../dto/list-checkout-days-query.dto';

/**
 * The days the customer’s cart can be delivered or picked up (SCH-API-2). Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer')
export class CustomerSchedulingController {
  @Get('checkout/days')
  @ApiTags(API_TAGS.customerScheduling.name)
  @ApiOperation({
    operationId: 'customerListCheckoutDays',
    summary: 'Days I can choose',
    description:
      'Customer app, checkout day picker. Every day of the booking horizon from today (Riyadh), for the cart’s store and kinds of order: the cut-offs and lead days, closed days, the store’s capacity and, for pickup, its hours decide each day. Refetch after changing the method or the address. CART_EMPTY for an empty cart; FULFILMENT_NOT_SUPPORTED when the cart’s products do not allow the method. ORDERING_PAUSED while orders are paused (`details.messageAr`, `details.messageEn`: the admin’s message). Until SCH-API-2 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: CheckoutDayListResponseDto,
    description: 'The days.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.CART_EMPTY,
    ErrorCode.FULFILMENT_NOT_SUPPORTED,
    ErrorCode.ORDERING_PAUSED,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  listCheckoutDays(
    @Query() query: ListCheckoutDaysQueryDto,
  ): Promise<CheckoutDayListResponseDto> {
    return notImplemented('SCH-API-2', query);
  }
}
