import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { LocalizedNameDto } from '@common/dto/localized-name.dto';
import { MAX_SORT_ORDER } from '../../domain/ordered-reference-lists.constants';

/** Changes to an admin list entry; a field left out stays as it is. */
export class UpdateReferenceItemDto {
  @ApiPropertyOptional({
    type: LocalizedNameDto,
    description:
      'The new name in Arabic and English, both together; left out: the name stays.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedNameDto)
  name?: LocalizedNameDto;

  @ApiPropertyOptional({
    example: false,
    description:
      '`false`: the entry can no longer be chosen for a product (products using it keep it), and an inactive category hides its products from the public catalog; `true`: back in use. Left out: unchanged.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: MAX_SORT_ORDER,
    description:
      'Categories only: the display order, lower first (0 by default). Another list refuses it (VALIDATION_FAILED `isOrderedList`).',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_SORT_ORDER)
  sortOrder?: number;
}
