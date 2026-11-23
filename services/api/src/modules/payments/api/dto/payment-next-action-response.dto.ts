import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_NEXT_ACTION_TYPES } from '../../domain/payment-next-action-types.constants';

/** What the app does to finish paying: open `redirectUrl` (the provider’s hosted page) in a web view, and close it when it reaches `returnUrl`. The result always comes from the server: then read the order. */
export class PaymentNextActionResponseDto {
  @ApiProperty({
    enum: PAYMENT_NEXT_ACTION_TYPES,
    example: 'redirect',
    description: 'Always `redirect` for now.',
  })
  type!: (typeof PAYMENT_NEXT_ACTION_TYPES)[number];

  @ApiProperty({
    example:
      'https://api.staging.jazlah.example/v1/webhooks/payments/fake/pages/7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The hosted payment page to open. On staging the fake provider’s page (approve or decline); never build or change it.',
  })
  redirectUrl!: string;

  @ApiProperty({
    example:
      'jazlah://checkout/pay/2b1c0d9e-8f7a-4b6c-9d5e-4f3a2b1c0d9e/return',
    description:
      'Where the page sends the customer when done: close the web view on this scheme, host and path (any query), then poll GET /v1/customer/orders/{id}.',
  })
  returnUrl!: string;
}
