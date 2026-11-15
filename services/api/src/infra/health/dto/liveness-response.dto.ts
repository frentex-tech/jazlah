import { ApiProperty } from '@nestjs/swagger';

/** The body of `GET /v1/health`. */
export class LivenessResponseDto {
  @ApiProperty({
    description: 'Always ok: the process answers.',
    enum: ['ok'],
    example: 'ok',
  })
  readonly status!: 'ok';
}
