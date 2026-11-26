import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { trimText } from '@common/dto/trim-text';
import { PRODUCT_PACKAGINGS } from '@modules/catalog';

/** A product with its chosen options and quantity. */
export class CartItemInputDto {
  @ApiProperty({
    format: 'uuid',
    example: '2b1c0d9e-8f7a-4b6c-9d5e-4f3a2b1c0d9e',
    description: 'The product (UUID), from the public catalog.',
  })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The chosen size (`sizes[].id` of the public product).',
  })
  @IsUUID()
  sizeId!: string;

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The chosen cutting style (`cuttings[].cuttingStyleId`); null or left out: none (OPTION_REQUIRED when the product offers cuttings).',
  })
  @IsOptional()
  @IsUUID()
  cuttingStyleId?: string | null;

  @ApiPropertyOptional({
    enum: PRODUCT_PACKAGINGS,
    nullable: true,
    example: 'vacuum',
    description:
      'The chosen packaging (`packagings[].packaging`; `none` is the product’s own "no packaging" option); null or left out: the product offers no packaging.',
  })
  @IsOptional()
  @IsIn(PRODUCT_PACKAGINGS)
  packaging?: (typeof PRODUCT_PACKAGINGS)[number] | null;

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    example: ['7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b'],
    description:
      'The "without" items chosen (`exclusions[].id`), each once, at most 20; left out: none.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  exclusionItemIds?: string[];

  @ApiPropertyOptional({
    example: 'بدون شحم',
    description:
      'A note on the line, up to 200 characters; lines differing only by note stay separate.',
  })
  @IsOptional()
  @Transform(trimText)
  @IsString()
  @Length(1, 200)
  notes?: string;

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 99,
    example: 1,
    description: 'How many, 1 to 99.',
  })
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}
