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
  @ApiProperty({ type: LocalizedTextResponseDto })
  name!: LocalizedTextResponseDto;

  @ApiProperty({ type: OptionalLocalizedTextResponseDto })
  description!: OptionalLocalizedTextResponseDto;

  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  categoryId!: string;

  @ApiProperty({ type: String, format: 'uuid', nullable: true, example: null })
  meatTypeId!: string | null;

  @ApiProperty({ type: [ProductImageResponseDto] })
  images!: ProductImageResponseDto[];

  @ApiProperty({ type: [ProductSizeResponseDto] })
  sizes!: ProductSizeResponseDto[];

  @ApiProperty({ type: [ProductCuttingResponseDto] })
  cuttings!: ProductCuttingResponseDto[];

  @ApiProperty({ enum: PRODUCT_PACKAGINGS, isArray: true, example: ['trays'] })
  packagings!: ProductPackaging[];

  @ApiProperty({
    type: [String],
    example: ['7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b'],
  })
  exclusionItemIds!: string[];
}
