import { ApiProperty } from '@nestjs/swagger';
import { PRODUCT_PACKAGINGS } from '../../domain/product-packagings.constants';
import type { ProductPackaging } from '../../domain/product-packaging.type';

/** A cutting style and a packaging a customer may not choose together. */
export class IncompatiblePairResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The id (UUID) of one of the product’s cutting styles.',
  })
  cuttingStyleId!: string;

  @ApiProperty({
    enum: PRODUCT_PACKAGINGS,
    example: 'vacuum',
    description:
      'One of the product’s packagings, not allowed with that cutting style.',
  })
  packaging!: ProductPackaging;
}
