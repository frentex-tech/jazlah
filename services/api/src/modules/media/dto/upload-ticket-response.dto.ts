import { ApiProperty } from '@nestjs/swagger';

/**
 * How to upload one file: POST `url` as multipart/form-data with every entry of `fields`,
 * then the file in a part named `file`, last, before `expiresAt`; then confirm `mediaId`
 * before `confirmBy`.
 */
export class UploadTicketResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  mediaId!: string;

  @ApiProperty({ example: 'https://storage.example.com/jazla-private' })
  url!: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'Form fields to send, unchanged, before the file.',
    example: { key: 'staging/vendor/document/2026/11/15/7f3a…', Policy: '…' },
  })
  fields!: Record<string, string>;

  @ApiProperty({ example: '2026-11-15T10:05:00.000Z' })
  expiresAt!: Date;

  @ApiProperty({
    description: 'The last moment the upload may be confirmed.',
    example: '2026-11-15T11:00:00.000Z',
  })
  confirmBy!: Date;
}
