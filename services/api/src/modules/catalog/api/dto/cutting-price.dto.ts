import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';

/** A new extra price for one of the product's cutting styles. */
export class CuttingPriceDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The id (UUID) of a cutting style the product offers; another one is VALIDATION_FAILED `isCuttingOfProduct`.',
  })
  @IsUUID()
  cuttingStyleId!: string;

  @ApiProperty({
    minimum: 0,
    maximum: PRODUCT_LIMITS.maxPriceHalalas,
    example: 1000,
    description:
      'The new extra price for this cutting style, in halalas, VAT included (`1500` is 15.00 SAR); 0 for no extra charge.',
  })
  @IsInt()
  @Min(0)
  @Max(PRODUCT_LIMITS.maxPriceHalalas)
  extraPriceHalalas!: number;
}
