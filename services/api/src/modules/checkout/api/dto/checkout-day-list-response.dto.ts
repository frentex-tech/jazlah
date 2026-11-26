import { ApiProperty } from '@nestjs/swagger';
import { CheckoutDayResponseDto } from './checkout-day-response.dto';

/** Every day of the booking horizon, from today, in date order. */
export class CheckoutDayListResponseDto {
  @ApiProperty({
    type: [CheckoutDayResponseDto],
    description: 'The days, today first.',
  })
  items!: CheckoutDayResponseDto[];
}
