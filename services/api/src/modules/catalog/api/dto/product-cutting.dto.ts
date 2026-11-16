import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';

/** A cutting style a product offers (FR-PRD-03), with its extra price. */
export class ProductCuttingDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  @IsUUID()
  cuttingStyleId!: string;

  @ApiProperty({
    minimum: 0,
    maximum: PRODUCT_LIMITS.maxPriceHalalas,
    description: 'The extra price in halalas, VAT included; 0 for none.',
    example: 1500,
  })
  @IsInt()
  @Min(0)
  @Max(PRODUCT_LIMITS.maxPriceHalalas)
  extraPriceHalalas!: number;
}
