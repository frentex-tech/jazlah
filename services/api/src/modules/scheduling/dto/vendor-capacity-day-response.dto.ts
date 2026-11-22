import { ApiProperty } from '@nestjs/swagger';

/** One day of a vendor’s capacity: its limits and what is booked. */
export class VendorCapacityDayResponseDto {
  @ApiProperty({
    example: '2026-11-24',
    description: 'The day, Riyadh calendar `yyyy-MM-dd`.',
  })
  date!: string;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    example: 60,
    description:
      'This day’s own order limit; null: the vendor’s (or the platform’s) daily limit.',
  })
  ordersLimit!: number | null;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    example: null,
    description: 'This day’s own carcass limit; null: the daily limit.',
  })
  carcassesLimit!: number | null;

  @ApiProperty({
    type: 'integer',
    example: 12,
    description: 'Orders already booked for the day.',
  })
  ordersBooked!: number;

  @ApiProperty({
    type: 'integer',
    example: 3,
    description: 'Carcasses already booked for the day.',
  })
  carcassesBooked!: number;
}
