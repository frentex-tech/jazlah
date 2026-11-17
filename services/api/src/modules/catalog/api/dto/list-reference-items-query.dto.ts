import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PageQueryDto } from '@common/dto/page-query.dto';

/** The query of an admin list: a page, optionally only active or only inactive entries. */
export class ListReferenceItemsQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    enum: ['true', 'false'],
    example: 'true',
    description:
      '`true`: only active entries (the ones vendors can choose); `false`: only inactive ones. Left out: both.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  isActive?: boolean;
}
