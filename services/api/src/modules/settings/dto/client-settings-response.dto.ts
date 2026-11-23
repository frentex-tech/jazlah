import { ApiProperty } from '@nestjs/swagger';
import { TimeWindowDto } from '@common/dto/time-window.dto';
import { OrderingPauseResponseDto } from './ordering-pause-response.dto';

/** What the apps need of the operations settings before checkout. */
export class ClientSettingsResponseDto {
  @ApiProperty({
    type: TimeWindowDto,
    description: 'The delivery window, Riyadh time.',
  })
  deliveryWindow!: TimeWindowDto;

  @ApiProperty({
    type: 'integer',
    example: 14,
    description: 'How many days ahead can be booked, counting today.',
  })
  bookingHorizonDays!: number;

  @ApiProperty({
    type: 'integer',
    example: 10000,
    description:
      'The smallest order (halalas, VAT included), compared with the subtotal before discounts.',
  })
  minOrderHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 2500,
    description:
      'The delivery fee of a delivery order (halalas, VAT included).',
  })
  deliveryFeeHalalas!: number;

  @ApiProperty({
    example: true,
    description:
      'Whether cash on delivery is offered at all (each order also needs its type and total allowed).',
  })
  codEnabled!: boolean;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    example: 150_000,
    description:
      'The largest order total cash on delivery is offered for; null: no limit.',
  })
  codMaxOrderHalalas!: number | null;

  @ApiProperty({
    type: OrderingPauseResponseDto,
    description: 'Whether new orders are paused, with the message to show.',
  })
  paused!: OrderingPauseResponseDto;
}
