import { Module } from '@nestjs/common';
import { PaymentWebhooksController } from './api/controllers/webhook.controller';

/**
 * Payments (PAY-API-1): payment attempts through the payments port, provider webhooks, cash on delivery rules and the wallet tender. Until its tasks land, the controllers carry the contract and answer NOT_IMPLEMENTED.
 */
@Module({
  controllers: [PaymentWebhooksController],
})
export class PaymentsModule {}
