import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

/** Switches one of the product's sizes on or off. */
export class SizeAvailabilityDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The id (UUID) of one of the product’s sizes (`sizes[].id` of the product); another one is VALIDATION_FAILED `isSizeOfProduct`.',
  })
  @IsUUID()
  sizeId!: string;

  @ApiProperty({
    example: false,
    description:
      '`true`: this size can be ordered; `false`: out of stock, shown on the product page but not orderable.',
  })
  @IsBoolean()
  isAvailable!: boolean;
}
