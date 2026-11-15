import { ApiProperty } from '@nestjs/swagger';

/** A confirmed file: what was checked. Refer to it by `id` (a vendor logo, a document). */
export class MediaFileResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({ example: 'vendor.logo' })
  purpose!: string;

  @ApiProperty({ enum: ['public', 'private'], example: 'public' })
  visibility!: 'public' | 'private';

  @ApiProperty({ enum: ['ready'], example: 'ready' })
  status!: 'ready';

  @ApiProperty({ example: 48213 })
  sizeBytes!: number;

  @ApiProperty({
    description: 'The type read from the file itself.',
    example: 'image/png',
  })
  contentType!: string;

  @ApiProperty({ type: String, nullable: true, example: 'logo.png' })
  originalFileName!: string | null;

  @ApiProperty({ example: '2026-11-15T10:01:00.000Z' })
  confirmedAt!: Date;
}
