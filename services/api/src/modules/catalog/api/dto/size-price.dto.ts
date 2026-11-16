import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';

/** A new price for one of the product's sizes. */
export class SizePriceDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  @IsUUID()
  sizeId!: string;

  @ApiProperty({
    minimum: 1,
    maximum: PRODUCT_LIMITS.maxPriceHalalas,
    description: 'Halalas, VAT included.',
    example: 89000,
  })
  @IsInt()
  @Min(1)
  @Max(PRODUCT_LIMITS.maxPriceHalalas)
  priceHalalas!: number;
}
