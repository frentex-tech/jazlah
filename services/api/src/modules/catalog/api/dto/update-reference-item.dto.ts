import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { LocalizedNameDto } from '@common/dto/localized-name.dto';

/** Changes to an admin list entry; a field left out stays as it is. */
export class UpdateReferenceItemDto {
  @ApiPropertyOptional({ type: LocalizedNameDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedNameDto)
  name?: LocalizedNameDto;

  @ApiPropertyOptional({
    description:
      'False: no longer offered for new products; an inactive category hides its products.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
