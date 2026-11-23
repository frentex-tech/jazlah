import { ApiProperty } from '@nestjs/swagger';
import { REFUND_DESTINATIONS } from '../../domain/refund-destinations.constants';
import { REFUND_STATUSES } from '../../domain/refund-statuses.constants';

/** A refund of part or all of the order (cancellations and refunds: Sprint 4). */
export class OrderRefundResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The refund (UUID).',
  })
  id!: string;

  @ApiProperty({
    type: 'integer',
    example: 97000,
    description: 'How much, in halalas.',
  })
  amountHalalas!: number;

  @ApiProperty({
    enum: REFUND_DESTINATIONS,
    example: 'wallet',
    description: 'Where it goes.',
  })
  destination!: (typeof REFUND_DESTINATIONS)[number];

  @ApiProperty({
    enum: REFUND_STATUSES,
    example: 'succeeded',
    description: 'Where it is.',
  })
  status!: (typeof REFUND_STATUSES)[number];

  @ApiProperty({
    example: 'تأخر التوصيل',
    description: 'Why, as written by staff.',
  })
  reason!: string;

  @ApiProperty({
    example: '2026-11-22T11:00:00.000Z',
    description: 'When it was made (UTC).',
  })
  createdAt!: Date;
}
