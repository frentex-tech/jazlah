import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { IsPageCursor } from '../decorators/is-page-cursor.decorator';
import { PAGE_SIZE } from '../pagination/page-size.constants';

/**
 * The query of every list endpoint (http.md, "Lists"): keyset pagination with an opaque
 * cursor, newest first, no total count. A list's own query DTO extends it with filters.
 */
export class PageQueryDto {
  @ApiPropertyOptional({
    description:
      'The `nextCursor` of the previous page; omit it for the first page. Opaque: never build or change it.',
    example: 'WyIyMDI2LTExLTE1VDEwOjAwOjAwLjAwMFoiLCI3ZjNhIl0',
  })
  @IsOptional()
  @IsPageCursor()
  cursor?: string;

  @ApiPropertyOptional({
    description: `How many items to return, 1 to ${PAGE_SIZE.max}.`,
    minimum: 1,
    maximum: PAGE_SIZE.max,
    default: PAGE_SIZE.default,
    example: PAGE_SIZE.default,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGE_SIZE.max)
  limit?: number;
}
