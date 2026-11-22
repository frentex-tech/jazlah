import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { Public } from '@common/decorators/public.decorator';
import { ErrorCode } from '@common/errors/error-code.enum';
import { notImplemented } from '@common/errors/not-implemented';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { PaymentProviderParamDto } from '../dto/payment-provider-param.dto';
import { PaymentWebhookAckResponseDto } from '../dto/payment-webhook-ack-response.dto';

/**
 * Events from payment providers (PAY-API-1): checked against the provider’s signature and processed at once and idempotently, keyed by the provider’s event id (workers are off on staging, so nothing waits for a queue). Every operation answers NOT_IMPLEMENTED (501) until its task lands; the shapes are the contract.
 */
@Public()
@Controller('webhooks/payments')
export class PaymentWebhooksController {
  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.webhooksPayments.name)
  @ApiOperation({
    operationId: 'webhooksReceivePaymentEvent',
    summary: 'A payment provider’s event',
    description:
      'Called by the payment provider, never by the apps. A captured payment confirms its order; a capture on an order already paid or cancelled is refunded in full and alerted. UNAUTHORIZED for a missing or wrong signature (logged as an alert); NOT_FOUND for a provider we do not use. The body is the provider’s own. Until PAY-API-1 lands: NOT_IMPLEMENTED.',
  })
  @ApiOkResponse({
    type: PaymentWebhookAckResponseDto,
    description: 'The event was recorded.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.UNAUTHORIZED,
    ErrorCode.NOT_FOUND,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.RATE_LIMITED,
  )
  receivePaymentEvent(
    @Param() params: PaymentProviderParamDto,
  ): Promise<PaymentWebhookAckResponseDto> {
    return notImplemented('PAY-API-1', params);
  }
}
