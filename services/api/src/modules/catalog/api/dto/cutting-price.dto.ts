import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';

/** A new extra price for one of the product's cutting styles. */
export class CuttingPriceDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  @IsUUID()
  cuttingStyleId!: string;

  @ApiProperty({
    minimum: 0,
    maximum: PRODUCT_LIMITS.maxPriceHalalas,
    description: 'Halalas, VAT included; 0 for none.',
    example: 1000,
  })
  @IsInt()
  @Min(0)
  @Max(PRODUCT_LIMITS.maxPriceHalalas)
  extraPriceHalalas!: number;
}
