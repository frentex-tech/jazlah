import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { LocalizedNameDto } from '@common/dto/localized-name.dto';
import { MAX_SORT_ORDER } from '../../domain/ordered-reference-lists.constants';

/** A new entry of an admin list: its name in both languages; a category's order. */
export class CreateReferenceItemDto {
  @ApiProperty({ type: LocalizedNameDto })
  @ValidateNested()
  @Type(() => LocalizedNameDto)
  name!: LocalizedNameDto;

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
