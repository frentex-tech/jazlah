import { ApiProperty } from '@nestjs/swagger';
import { PRODUCT_PACKAGINGS } from '../../domain/product-packagings.constants';
import type { ProductPackaging } from '../../domain/product-packaging.type';
import { NamedReferenceResponseDto } from './named-reference-response.dto';

/** A cutting style and a packaging a product may not offer together. */
export class VendorIncompatibilityResponseDto {
  @ApiProperty({
    type: NamedReferenceResponseDto,
    description:
      'The cutting style (active), with its Arabic and English name.',
  })
  cuttingStyle!: NamedReferenceResponseDto;

  @ApiProperty({
    enum: PRODUCT_PACKAGINGS,
    example: 'vacuum',
    description:
      'The packaging it cannot be packed in: `trays`, `bags`, `vacuum`, `none`.',
  })
  packaging!: ProductPackaging;
}
