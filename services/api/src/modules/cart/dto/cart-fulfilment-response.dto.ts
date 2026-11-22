import { ApiProperty } from '@nestjs/swagger';
import { TimeWindowDto } from '@common/dto/time-window.dto';
import { FULFILMENT_METHODS, PickupPointResponseDto } from '@modules/orders';

/** The fulfilment chosen for the cart. */
export class CartFulfilmentResponseDto {
  @ApiProperty({
    enum: FULFILMENT_METHODS,
    enumName: 'FulfilmentMethod',
    example: 'delivery',
    description: 'Delivered or picked up.',
  })
  method!: (typeof FULFILMENT_METHODS)[number];

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The saved address for delivery; null for pickup.',
  })
  addressId!: string | null;

  @ApiProperty({
    example: '2026-11-24',
    description: 'The day, `yyyy-MM-dd`.',
  })
  date!: string;

  @ApiProperty({
    type: TimeWindowDto,
    nullable: true,
    description: 'The delivery window, Riyadh time; null for pickup.',
  })
  window!: TimeWindowDto | null;

  @ApiProperty({
    type: PickupPointResponseDto,
    nullable: true,
    description: 'Where to collect it; null for delivery.',
  })
  pickupPoint!: PickupPointResponseDto | null;
}
