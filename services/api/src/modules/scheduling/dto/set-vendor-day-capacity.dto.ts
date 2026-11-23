import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min, ValidateIf } from 'class-validator';

/** One day’s own limits for a vendor. */
export class SetVendorDayCapacityDto {
  @ApiProperty({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 100_000,
    example: 60,
    description: 'Orders that day, 1 to 100000; null: the daily limit.',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(100_000)
  ordersLimit!: number | null;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    minimum: 1,
    maximum: 100_000,
    example: null,
    description: 'Carcasses that day, 1 to 100000; null: the daily limit.',
  })
  @ValidateIf((_dto, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(100_000)
  carcassesLimit!: number | null;
}
