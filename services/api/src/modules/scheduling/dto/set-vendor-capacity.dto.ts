import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min, ValidateIf } from 'class-validator';

/** A vendor’s own daily limits. */
export class SetVendorCapacityDto {
  @ApiProperty({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 100_000,
    example: 40,
    description: 'Orders per day, 1 to 100000; null: use the platform default.',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(100_000)
  ordersPerDay!: number | null;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 100_000,
    example: null,
    description:
      'Carcasses per day, 1 to 100000; null: use the platform default.',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(100_000)
  carcassesPerDay!: number | null;
}
