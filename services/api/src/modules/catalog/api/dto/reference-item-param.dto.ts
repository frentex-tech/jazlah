import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { ReferenceListParamDto } from './reference-list-param.dto';

/** The `:list` and `:id` path parameters: one entry of an admin list. */
export class ReferenceItemParamDto extends ReferenceListParamDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The id (a UUID) of an entry of that list; another value is VALIDATION_FAILED on `id`.',
  })
  @IsUUID()
  id!: string;
}
