import { ApiProperty } from '@nestjs/swagger';
import { PRODUCT_PACKAGINGS } from '../../domain/product-packagings.constants';
import type { ProductPackaging } from '../../domain/product-packaging.type';

/** A global rule: this cutting style cannot be packed this way. */
export class CuttingPackagingIncompatibilityResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  cuttingStyleId!: string;

  @ApiProperty({ enum: PRODUCT_PACKAGINGS, example: 'vacuum' })
  packaging!: ProductPackaging;

  @ApiProperty({ example: '2026-11-16T09:00:00.000Z' })
  createdAt!: Date;
}
