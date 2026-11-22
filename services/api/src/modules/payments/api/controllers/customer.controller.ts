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
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CUSTOMER_AUTH_ERRORS } from '@common/decorators/customer-auth-errors.constants';
import { IdParamDto } from '@common/dto/id-param.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { notImplemented } from '@common/errors/not-implemented';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ListPaymentMethodsQueryDto } from '../dto/list-payment-methods-query.dto';
import { OrderWithPaymentResponseDto } from '../dto/order-with-payment-response.dto';
import { PaymentMethodListResponseDto } from '../dto/payment-method-list-response.dto';

/**
 * Payment methods and new payment attempts (PAY-API-1). Payments go through the payments port; on staging the fake provider’s hosted page; the result always comes from the server. Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer')
export class CustomerPaymentsController {
  @Get('checkout/payment-methods')
  @ApiTags(API_TAGS.customerPayments.name)
  @ApiOperation({
    operationId: 'customerListPaymentMethods',
    summary: 'How I can pay',
    description:
      'Customer app, checkout payment step (or paying an unpaid order again with `orderId`): the methods for the cart’s (or the order’s) total and kinds, and the wallet balance. NOT_FOUND for an order that is not the customer’s; ORDER_NOT_PAYABLE for one no longer waiting for payment; CART_EMPTY without `orderId` and an empty cart. Until PAY-API-1 lands: NOT_IMPLEMENTED.',
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
  listPaymentMethods(
    @Query() query: ListPaymentMethodsQueryDto,
  ): Promise<PaymentMethodListResponseDto> {
    return notImplemented('PAY-API-1', query);
  }

  @Post('orders/:id/payments')
  @ApiTags(API_TAGS.customerPayments.name)
  @ApiOperation({
    operationId: 'customerCreateOrderPayment',
    summary: 'Pay an unpaid order again',
    description:
      'Customer app, after a failed or abandoned payment, while the order is `pending_payment` (see `expiresAt`). One open payment per order: while the latest is still `initiated` with the same method, it is answered again (with its `nextAction`) and nothing new is made; with another method, PAYMENT_IN_PROGRESS (`details.paymentId`) until it ends. `wallet` or a wallet part is taken at once; cash on delivery follows the confirmation setting. ORDER_NOT_PAYABLE: the order is paid, cancelled or expired. PAYMENT_METHOD_NOT_AVAILABLE (`details.method`); WALLET_INSUFFICIENT (`details.balanceHalalas`). NOT_FOUND for another customer’s order. Until PAY-API-1 lands: NOT_IMPLEMENTED.',
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
}
