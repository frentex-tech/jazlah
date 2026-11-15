import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * The `:id` path parameter of an endpoint, `@Param() params: IdParamDto`: a UUID, or
 * VALIDATION_FAILED with a field error on `id` through the global pipe.
 */
export class IdParamDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  @IsUUID()
  id!: string;
}
