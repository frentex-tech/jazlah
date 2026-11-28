import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsIn, IsString, ValidateIf } from 'class-validator';
import { CharLength } from '@common/decorators/char-length.decorator';
import { trimText } from '@common/dto/trim-text';
import { ORDER_STATUSES } from '../../domain/order-statuses.constants';

/** Moves an order to another status. */
export class TransitionOrderDto {
  @ApiProperty({
    enum: ORDER_STATUSES,
    enumName: 'OrderStatus',
    example: 'preparing',
    description:
      'The status to move to; one of the order’s `allowedTransitions` (ORDER_TRANSITION_NOT_ALLOWED otherwise).',
  })
  @IsIn(ORDER_STATUSES)
  to!: (typeof ORDER_STATUSES)[number];

  @ApiPropertyOptional({
    example: 'العميل ما رد على الاتصال',
    description:
      'A note kept in the history, up to 500 characters; required when moving to `cancelled` (VALIDATION_FAILED on `note` without it): for a rejected cash-on-delivery order, the reason the customer sees.',
  })
  @ValidateIf(
    (body: TransitionOrderDto) =>
      body.to === 'cancelled' ||
      (body.note !== undefined && body.note !== null),
  )
  @IsDefined()
  @Transform(trimText)
  @IsString()
  @CharLength(1, 500)
  note?: string;
}
