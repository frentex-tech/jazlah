import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { trimText } from '@common/dto/trim-text';

/** A page of an admin list of vendors or applications, optionally narrowed by a search. */
export class BusinessSearchQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    minLength: 2,
    maxLength: 100,
    description:
      'Search: part of the store name in Arabic or English (any case) or of the commercial registration number (Latin or Arabic digits). 2 to 100 characters after trimming; % and _ match themselves.',
    example: 'النخبة',
  })
  @Transform(trimText)
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  q?: string;
}
