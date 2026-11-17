import { ApiProperty } from '@nestjs/swagger';

/** The customer's current marketing consent. */
export class MarketingConsentResponseDto {
  @ApiProperty({
    description:
      'Whether the customer accepts marketing messages. False until the customer grants it (opt-in).',
    example: true,
  })
  granted!: boolean;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description:
      'When the current choice was recorded, UTC (ISO 8601); null when the customer never chose (granted is then false).',
    example: '2026-11-15T10:00:00.000Z',
  })
  changedAt!: Date | null;
}
