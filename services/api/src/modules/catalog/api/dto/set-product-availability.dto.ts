import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { PRODUCT_LIMITS } from '../../domain/product-limits.constants';
import { SizeAvailabilityDto } from './size-availability.dto';

/** Whether a product, and each of some of its sizes, can be ordered now. */
export class SetProductAvailabilityDto {
  @ApiProperty({
    example: false,
    description:
      '`true`: can be ordered (shown in the public catalog when published); `false`: out of stock, left out of the public list, its page shown out of stock.',
  })
  @IsBoolean()
  isAvailable!: boolean;

  @ApiPropertyOptional({
    type: [SizeAvailabilityDto],
    maxItems: PRODUCT_LIMITS.sizes,
    description:
      'Sizes to switch, each at most once (VALIDATION_FAILED `isNotRepeated` on `sizes.<i>.sizeId`); left out or empty: every size keeps its availability. A new size starts available.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(PRODUCT_LIMITS.sizes)
  @ValidateNested({ each: true })
  @Type(() => SizeAvailabilityDto)
  sizes?: SizeAvailabilityDto[];
}
