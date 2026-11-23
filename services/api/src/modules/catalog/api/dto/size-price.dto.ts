import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';

/** A new price for one of the product's sizes. */
export class SizePriceDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The id (UUID) of one of the product’s sizes (`sizes[].id` of the product); another one is VALIDATION_FAILED `isSizeOfProduct`.',
  })
  @IsUUID()
  sizeId!: string;

  @ApiProperty({
    minimum: 1,
    maximum: PRODUCT_LIMITS.maxPriceHalalas,
    example: 89000,
    description:
      'The new price of this size, in halalas, VAT included (`89000` is 890.00 SAR); at least 1.',
  })
  @IsInt()
  @Min(1)
  @Max(PRODUCT_LIMITS.maxPriceHalalas)
  priceHalalas!: number;
}
