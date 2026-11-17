import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { OptionalLocalizedTextResponseDto } from '@common/dto/optional-localized-text-response.dto';
import { PRODUCT_PACKAGINGS } from '../../domain/product-packagings.constants';
import type { ProductPackaging } from '../../domain/product-packaging.type';
import { ProductCuttingResponseDto } from './product-cutting-response.dto';
import { ProductImageResponseDto } from './product-image-response.dto';
import { ProductSizeResponseDto } from './product-size-response.dto';

/** The content a change request proposes, as the vendor wrote it (ids, not names). */
export class ProductContentResponseDto {
  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'The proposed name in Arabic and English.',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    type: OptionalLocalizedTextResponseDto,
    description:
      'The proposed description in Arabic and English, each null when absent.',
  })
  description!: OptionalLocalizedTextResponseDto;

  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The id (UUID) of the proposed category.',
  })
  categoryId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'The id (UUID) of the proposed meat type; null for none.',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  meatTypeId!: string | null;

  @ApiProperty({
    type: [ProductImageResponseDto],
    description:
      'The proposed images in display order, the first is the cover.',
  })
  images!: ProductImageResponseDto[];

  @ApiProperty({
    type: [ProductSizeResponseDto],
    description:
      'The proposed sizes in display order; a size with an id is an existing one (its live price is kept on approval), a size with a null id is new.',
  })
  sizes!: ProductSizeResponseDto[];

  @ApiProperty({
    type: [ProductCuttingResponseDto],
    description: 'The proposed cutting styles, by id (names are null here).',
  })
  cuttings!: ProductCuttingResponseDto[];

  @ApiProperty({
    enum: PRODUCT_PACKAGINGS,
    isArray: true,
    example: ['trays'],
    description: 'The proposed packagings: `trays`, `bags`, `vacuum`, `none`.',
  })
  packagings!: ProductPackaging[];

  @ApiProperty({
    type: [String],
    example: ['7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b'],
    description: 'The ids (UUIDs) of the proposed "without" items.',
  })
  exclusionItemIds!: string[];
}
