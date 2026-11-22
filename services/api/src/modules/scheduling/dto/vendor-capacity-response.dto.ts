import { ApiProperty } from '@nestjs/swagger';
import { VendorCapacityDayResponseDto } from './vendor-capacity-day-response.dto';

/** A vendor’s capacity: its daily limits and each day of the booking horizon. */
export class VendorCapacityResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The vendor (UUID).',
  })
  vendorId!: string;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    example: 40,
    description:
      'The vendor’s own daily order limit; null: the platform default (operations settings).',
  })
  ordersPerDay!: number | null;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    example: null,
    description:
      'The vendor’s own daily carcass limit; null: the platform default.',
  })
  carcassesPerDay!: number | null;

  @ApiProperty({
    type: [VendorCapacityDayResponseDto],
    description:
      'Every day of the booking horizon from today, with its own limits and bookings.',
  })
  days!: VendorCapacityDayResponseDto[];
}
