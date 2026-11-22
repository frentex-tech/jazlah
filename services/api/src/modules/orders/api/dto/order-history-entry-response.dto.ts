import { ApiProperty } from '@nestjs/swagger';
import { ORDER_ACTOR_TYPES } from '../../domain/order-actor-types.constants';
import { ORDER_STATUSES } from '../../domain/order-statuses.constants';

/** One move of the order between statuses. */
export class OrderHistoryEntryResponseDto {
  @ApiProperty({
    enum: ORDER_STATUSES,
    enumName: 'OrderStatus',
    nullable: true,
    example: 'pending_payment',
    description: 'The status before; null for the first entry (placed).',
  })
  from!: (typeof ORDER_STATUSES)[number] | null;

  @ApiProperty({
    enum: ORDER_STATUSES,
    enumName: 'OrderStatus',
    example: 'confirmed',
    description: 'The status after.',
  })
  to!: (typeof ORDER_STATUSES)[number];

  @ApiProperty({
    enum: ORDER_ACTOR_TYPES,
    example: 'system',
    description: 'Who moved it.',
  })
  actorType!: (typeof ORDER_ACTOR_TYPES)[number];

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description:
      'The note given with the move (a cancellation reason, for example); null for none.',
  })
  note!: string | null;

  @ApiProperty({
    example: '2026-11-22T10:03:00.000Z',
    description: 'When (UTC).',
  })
  at!: Date;
}
