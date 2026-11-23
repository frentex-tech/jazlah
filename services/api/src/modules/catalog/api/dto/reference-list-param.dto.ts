import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { REFERENCE_LIST_PATHS } from '../reference-list-paths.constants';
import type { ReferenceListPath } from '../reference-list-path.type';

/** The `:list` path parameter: which admin list. */
export class ReferenceListParamDto {
  @ApiProperty({
    enum: Object.keys(REFERENCE_LIST_PATHS),
    example: 'categories',
    description:
      'Which list: `categories`, `meat-types`, `cutting-styles` or `exclusion-items` (the "without" items a customer can ask to leave out). Another value is VALIDATION_FAILED on `list`.',
  })
  @IsIn(Object.keys(REFERENCE_LIST_PATHS))
  list!: ReferenceListPath;
}
