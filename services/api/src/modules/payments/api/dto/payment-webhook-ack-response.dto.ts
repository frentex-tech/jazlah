import { ApiProperty } from '@nestjs/swagger';

/** The provider’s event was received. */
export class PaymentWebhookAckResponseDto {
  @ApiProperty({
    example: true,
    description:
      'Always true: the event was recorded (a repeat of an event already processed changes nothing).',
  })
  received!: boolean;
}
