import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { COD_CONFIRMATION_MODES } from '../cod-confirmation-modes.constants';
import { ORDER_TYPES } from '../order-types.constants';

/** Cash on delivery: whether it is offered, up to what amount, for which orders, and how it is confirmed. */
export class CodSettingsDto {
  @ApiProperty({
    example: true,
    description: 'Whether customers may choose cash on delivery.',
  })
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 10_000_000,
    example: 150_000,
    description:
      'The largest order total (halalas, VAT included) cash on delivery is offered for; null: no limit.',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  maxOrderHalalas!: number | null;

  @ApiProperty({
    enum: ORDER_TYPES,
    enumName: 'OrderType',
    isArray: true,
    example: ['ready_meat', 'cooked'],
    description: 'The kinds of order it is offered for; empty: none.',
  })
  @IsArray()
  @ArrayUnique()
  @IsIn(ORDER_TYPES, { each: true })
  allowedOrderTypes!: (typeof ORDER_TYPES)[number][];

  @ApiProperty({
    enum: COD_CONFIRMATION_MODES,
    example: 'review',
    description:
      '`auto`: the order is confirmed when placed; `review`: it waits as `new` for an admin to confirm or reject it (POST /v1/admin/orders/{id}/transition).',
  })
  @IsIn(COD_CONFIRMATION_MODES)
  confirmation!: (typeof COD_CONFIRMATION_MODES)[number];
}
