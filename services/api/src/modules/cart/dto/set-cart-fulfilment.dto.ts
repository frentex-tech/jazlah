import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsISO8601,
  IsIn,
  IsString,
  IsUUID,
  Matches,
  ValidateIf,
} from 'class-validator';
import { FULFILMENT_METHODS } from '@modules/settings';

/** How and when the cart is to be fulfilled. */
export class SetCartFulfilmentDto {
  @ApiProperty({
    enum: FULFILMENT_METHODS,
    example: 'delivery',
    description:
      '`delivery` or `pickup`; one the cart’s products allow (FULFILMENT_NOT_SUPPORTED otherwise).',
  })
  @IsIn(FULFILMENT_METHODS)
  method!: (typeof FULFILMENT_METHODS)[number];

  @ApiPropertyOptional({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'One of the customer’s saved addresses (UUID); required for delivery, ignored for pickup.',
  })
  @ValidateIf((dto: SetCartFulfilmentDto) => dto.method === 'delivery')
  @IsUUID()
  addressId?: string;

  @ApiProperty({
    example: '2026-11-24',
    description:
      'The day, `yyyy-MM-dd`, one GET /v1/customer/checkout/days offers.',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'isCalendarDate' })
  @IsISO8601({ strict: true })
  date!: string;
}
