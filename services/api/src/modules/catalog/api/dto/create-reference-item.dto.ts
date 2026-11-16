import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { LocalizedNameDto } from '@common/dto/localized-name.dto';

/** A new entry of an admin list: its name in both languages. */
export class CreateReferenceItemDto {
  @ApiProperty({ type: LocalizedNameDto })
  @ValidateNested()
  @Type(() => LocalizedNameDto)
  name!: LocalizedNameDto;
}
