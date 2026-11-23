import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { FULFILMENT_METHODS } from '@modules/orders';

/** Which fulfilment method the days are for. */
export class ListCheckoutDaysQueryDto {
  @ApiProperty({
    enum: FULFILMENT_METHODS,
    enumName: 'FulfilmentMethod',
    example: 'delivery',
    description: '`delivery` or `pickup`.',
  })
  @IsIn(FULFILMENT_METHODS)
  method!: (typeof FULFILMENT_METHODS)[number];
}
