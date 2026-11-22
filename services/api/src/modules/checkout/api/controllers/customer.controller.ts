import { Body, Controller, Headers, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CUSTOMER_AUTH_ERRORS } from '@common/decorators/customer-auth-errors.constants';
import { ErrorCode } from '@common/errors/error-code.enum';
import { notImplemented } from '@common/errors/not-implemented';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { OrderWithPaymentResponseDto } from '@modules/payments';
import { PlaceOrderDto } from '../dto/place-order.dto';

/**
 * Placing the cart as an order, in one transaction (ORD-API-1). Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer')
export class CustomerCheckoutController {
  @Post('orders')
  @ApiTags(API_TAGS.customerCheckout.name)
  @ApiOperation({
    operationId: 'customerPlaceOrder',
    summary: 'Place my order',
    description:
      'Customer app, checkout "place order". Checks the cart again, then in one transaction: reserves the day’s capacity, uses the coupon, takes the wallet part, creates the order (`pending_payment`, or `new`/`confirmed` for cash on delivery and wallet only) and its payment attempt, and empties the cart. Open `payment.nextAction.redirectUrl` when it is not null; an unpaid order is cancelled after 15 minutes (`order.expiresAt`), giving back the capacity, the coupon and the wallet part. Refusals send the customer back: to the cart for CART_EMPTY, PRICE_CHANGED and ITEM_UNAVAILABLE (`details.lineIds`), MIN_ORDER_NOT_MET (`details.minOrderHalalas`, `details.remainingHalalas`) and the coupon codes; to the fulfilment step for FULFILMENT_REQUIRED, ADDRESS_NOT_COVERED, DAY_FULL and DAY_NOT_AVAILABLE; to the payment step for PAYMENT_METHOD_NOT_AVAILABLE and WALLET_INSUFFICIENT; to the profile for PROFILE_INCOMPLETE (no full name). ORDERING_PAUSED while orders are paused (`details.messageAr`, `details.messageEn`: the admin’s message). Until ORD-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: true,
    description:
      'A UUID the app makes once per attempt and sends again on a retry of the same attempt: the same key answers the first success again (the body is not compared); a refusal is not kept, so the same key may be sent again after fixing it. Missing or not a UUID: VALIDATION_FAILED on `Idempotency-Key`.',
    schema: {
      type: 'string',
      format: 'uuid',
      example: '3c1f8e2a-5b7d-4c9e-a1f0-6d2b8c4e7a90',
    },
  })
  @ApiCreatedResponse({
    type: OrderWithPaymentResponseDto,
    description: 'The order and its payment attempt.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.CART_EMPTY,
    ErrorCode.PRICE_CHANGED,
    ErrorCode.ITEM_UNAVAILABLE,
    ErrorCode.MIN_ORDER_NOT_MET,
    ErrorCode.COUPON_NOT_FOUND,
    ErrorCode.COUPON_EXPIRED,
    ErrorCode.COUPON_NOT_APPLICABLE,
    ErrorCode.COUPON_MIN_ORDER,
    ErrorCode.COUPON_LIMIT_REACHED,
    ErrorCode.FULFILMENT_REQUIRED,
    ErrorCode.ADDRESS_NOT_COVERED,
    ErrorCode.DAY_FULL,
    ErrorCode.DAY_NOT_AVAILABLE,
    ErrorCode.PAYMENT_METHOD_NOT_AVAILABLE,
    ErrorCode.WALLET_INSUFFICIENT,
    ErrorCode.PROFILE_INCOMPLETE,
    ErrorCode.ORDERING_PAUSED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  placeOrder(
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: PlaceOrderDto,
  ): Promise<OrderWithPaymentResponseDto> {
    return notImplemented('ORD-API-1', idempotencyKey, body);
  }
}
