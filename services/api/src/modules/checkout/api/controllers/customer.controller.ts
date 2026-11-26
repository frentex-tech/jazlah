import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IdempotencyKey } from '@common/decorators/idempotency-key.decorator';
import { CUSTOMER_AUTH_ERRORS } from '@common/decorators/customer-auth-errors.constants';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { notImplemented } from '@common/errors/not-implemented';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { toOrderResponse } from '@modules/orders';
import { ListCheckoutDaysUseCase } from '../../application/list-checkout-days.use-case';
import { ListPaymentMethodsUseCase } from '../../application/list-payment-methods.use-case';
import { PlaceOrderUseCase } from '../../application/place-order.use-case';
import { CheckoutDayListResponseDto } from '../dto/checkout-day-list-response.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ListCheckoutDaysQueryDto } from '../dto/list-checkout-days-query.dto';
import { ListPaymentMethodsQueryDto } from '../dto/list-payment-methods-query.dto';
import { OrderWithPaymentResponseDto } from '../dto/order-with-payment-response.dto';
import { PaymentMethodListResponseDto } from '../dto/payment-method-list-response.dto';
import { PlaceOrderDto } from '../dto/place-order.dto';
import { toCheckoutDayListResponse } from '../to-checkout-day-list-response';
import { toPaymentMethodListResponse } from '../to-payment-method-list-response';

/**
 * The days the cart can be fulfilled on (SCH-API-2: the route reads the cart, so it lives
 * here, not in scheduling), paying: the methods, placing the cart as an order in one transaction (ORD-API-1), and paying an unpaid order again (PAY-API-1). It joins the cart, the orders, the payments and the wallet. The days, the cart's payment methods and placing an order (cash on delivery) are live; paying again (`orderId`) and paying answer NOT_IMPLEMENTED (501) until PAY-API-1 lands.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer')
export class CustomerCheckoutController {
  constructor(
    private readonly listCheckoutDaysUseCase: ListCheckoutDaysUseCase,
    private readonly listPaymentMethodsUseCase: ListPaymentMethodsUseCase,
    private readonly placeOrderUseCase: PlaceOrderUseCase,
  ) {}

  @Get('checkout/days')
  @ApiTags(API_TAGS.customerScheduling.name)
  @ApiOperation({
    operationId: 'customerListCheckoutDays',
    summary: 'Days I can choose',
    description:
      'Customer app, checkout day picker. Every day of the booking horizon from today (Riyadh), for the cart’s store and kinds of order: the cut-offs and lead days, closed days, the store’s capacity and, for pickup, its hours decide each day. Refetch after changing the method or the address. Unpaid orders past `expiresAt` no longer count against a day. CART_EMPTY for an empty cart; FULFILMENT_NOT_SUPPORTED when the cart’s products do not allow the method. ORDERING_PAUSED while orders are paused (`details.messageAr`, `details.messageEn`: the admin’s message).',
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
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async listCheckoutDays(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListCheckoutDaysQueryDto,
  ): Promise<CheckoutDayListResponseDto> {
    return toCheckoutDayListResponse(
      await this.listCheckoutDaysUseCase.execute(user.userId, query.method),
    );
  }

  @Get('checkout/payment-methods')
  @ApiTags(API_TAGS.customerCheckout.name)
  @ApiOperation({
    operationId: 'customerListPaymentMethods',
    summary: 'How I can pay',
    description:
      'Customer app, checkout payment step (or paying an unpaid order again with `orderId`): the methods for the cart’s (or the order’s) total and kinds, and the wallet balance. NOT_FOUND for an order that is not the customer’s; ORDER_NOT_PAYABLE for one no longer waiting for payment; CART_EMPTY without `orderId` and an empty cart. Sprint 3 lists cash on delivery only, with a wallet balance of 0; paying again with `orderId` answers NOT_IMPLEMENTED until PAY-API-1 lands.',
  })
  @ApiOkResponse({
    type: PaymentMethodListResponseDto,
    description: 'The methods.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ORDER_NOT_PAYABLE,
    ErrorCode.CART_EMPTY,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async listPaymentMethods(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPaymentMethodsQueryDto,
  ): Promise<PaymentMethodListResponseDto> {
    if (query.orderId !== undefined) {
      return notImplemented('PAY-API-1', query);
    }
    return toPaymentMethodListResponse(
      await this.listPaymentMethodsUseCase.execute(user.userId),
    );
  }

  @Post('orders/:id/payments')
  @ApiTags(API_TAGS.customerCheckout.name)
  @ApiOperation({
    operationId: 'customerCreateOrderPayment',
    summary: 'Pay an unpaid order again',
    description:
      'Customer app, after a failed or abandoned payment, while the order is `pending_payment` (see `expiresAt`). One open payment per order: while the latest is still `initiated` with the same method, it is answered again (with its `nextAction`) and nothing new is made; with another method, PAYMENT_IN_PROGRESS (`details.paymentId`) until it ends. An `initiated` payment ends when the provider reports it, or 10 minutes after it started (then `cancelled`, checked when read, so another method can still be chosen before the order expires). `wallet` or a wallet part is taken at once; cash on delivery follows the confirmation setting. ORDER_NOT_PAYABLE: the order is paid, cancelled or expired. PAYMENT_METHOD_NOT_AVAILABLE (`details.method`); WALLET_INSUFFICIENT (`details.balanceHalalas`). NOT_FOUND for another customer’s order. Until PAY-API-1 lands: NOT_IMPLEMENTED.',
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
    description: 'The order and the payment attempt.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.ORDER_NOT_PAYABLE,
    ErrorCode.PAYMENT_IN_PROGRESS,
    ErrorCode.PAYMENT_METHOD_NOT_AVAILABLE,
    ErrorCode.WALLET_INSUFFICIENT,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  createOrderPayment(
    @Param() params: IdParamDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: CreatePaymentDto,
  ): Promise<OrderWithPaymentResponseDto> {
    return notImplemented('PAY-API-1', params, idempotencyKey, body);
  }

  @Post('orders')
  @ApiTags(API_TAGS.customerCheckout.name)
  @ApiOperation({
    operationId: 'customerPlaceOrder',
    summary: 'Place my order',
    description:
      'Customer app, checkout "place order". Checks the cart again, then in one transaction: reserves the day’s capacity, uses the coupon, takes the wallet part, creates the order (`pending_payment`, or `new`/`confirmed` for cash on delivery and wallet only) and its payment attempt, and empties the cart. Open `payment.nextAction.redirectUrl` when it is not null; an unpaid order is cancelled after 15 minutes (`order.expiresAt`), giving back the capacity, the coupon and the wallet part. Refusals send the customer back: to the cart for CART_EMPTY, PRICE_CHANGED and ITEM_UNAVAILABLE (`details.lineIds`), MIN_ORDER_NOT_MET (`details.minOrderHalalas`, `details.remainingHalalas`) and the coupon codes; to the fulfilment step for FULFILMENT_REQUIRED, ADDRESS_NOT_COVERED, DAY_FULL and DAY_NOT_AVAILABLE; to the payment step for PAYMENT_METHOD_NOT_AVAILABLE and WALLET_INSUFFICIENT; to the profile for PROFILE_INCOMPLETE (no full name). ORDERING_PAUSED while orders are paused (`details.messageAr`, `details.messageEn`: the admin’s message). Sprint 3 takes cash on delivery only (`paymentMethod: cod`, no wallet part): another method is PAYMENT_METHOD_NOT_AVAILABLE and a wallet part WALLET_INSUFFICIENT. The order starts `new` and `payment` is null (no payment record for cash). A line that can no longer be ordered, or whose price moved since it was accepted, is ITEM_UNAVAILABLE or PRICE_CHANGED with `details.lineIds`; nothing is charged at a price the customer did not see. IDEMPOTENCY_KEY_REUSED when the key was already used with a different body.',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: true,
    description:
      'A UUID the app makes once per attempt and sends again on a retry of the same attempt: the same key with the same body answers the first success again (the order as placed, whatever the cart is now); the same key with a different body is IDEMPOTENCY_KEY_REUSED. A refusal is not kept, so the same key may be sent again after fixing it. Missing or not a UUID: VALIDATION_FAILED on `Idempotency-Key`.',
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
    ErrorCode.FULFILMENT_NOT_SUPPORTED,
    ErrorCode.ADDRESS_NOT_COVERED,
    ErrorCode.DAY_FULL,
    ErrorCode.DAY_NOT_AVAILABLE,
    ErrorCode.PAYMENT_METHOD_NOT_AVAILABLE,
    ErrorCode.WALLET_INSUFFICIENT,
    ErrorCode.PROFILE_INCOMPLETE,
    ErrorCode.ORDERING_PAUSED,
    ErrorCode.IDEMPOTENCY_KEY_REUSED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async placeOrder(
    @CurrentUser() user: AuthenticatedUser,
    @IdempotencyKey() idempotencyKey: string,
    @Body() body: PlaceOrderDto,
  ): Promise<OrderWithPaymentResponseDto> {
    const order = await this.placeOrderUseCase.execute(
      user.userId,
      idempotencyKey,
      body,
    );
    return { order: toOrderResponse(order), payment: null };
  }
}
