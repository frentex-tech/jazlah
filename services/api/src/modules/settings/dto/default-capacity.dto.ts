import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

/** How much a vendor can take per day unless the vendor or the day has its own limit. */
export class DefaultCapacityDto {
  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 100_000,
    example: 40,
    description: 'Orders per day, 1 to 100000.',
  })
  @IsInt()
  @Min(1)
  @Max(100_000)
  ordersPerDay!: number;

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 100_000,
    example: 10,
    description: 'Whole carcasses per day, 1 to 100000.',
  })
  @IsInt()
  @Min(1)
  @Max(100_000)
  carcassesPerDay!: number;
}
