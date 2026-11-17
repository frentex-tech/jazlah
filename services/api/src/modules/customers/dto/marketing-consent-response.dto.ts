import { ApiProperty } from '@nestjs/swagger';

/** The customer's current marketing consent. */
export class MarketingConsentResponseDto {
  @ApiProperty({
    description: 'False until the customer grants it (opt-in).',
    example: true,
  })
  granted!: boolean;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description:
      'When the current choice was recorded; null when the customer never chose.',
    example: '2026-11-17T09:00:00.000Z',
  })
  changedAt!: Date | null;
}
