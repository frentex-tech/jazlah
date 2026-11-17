import { ApiProperty } from '@nestjs/swagger';

/** A confirmed file: what was checked. Refer to it by `id` (a vendor logo, a document). */
export class MediaFileResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The id of the file (UUID), the ticket `mediaId`. Give it to the endpoint that uses the file (a product `imageMediaIds`, the vendor `logoMediaId`, a vendor application `documents[].mediaId`); only the user who uploaded it can.',
  })
  id!: string;

  @ApiProperty({
    example: 'catalog.product-image',
    description:
      'The upload purpose the ticket was requested for (`catalog.product-image`, `catalog.category-image`, `vendor.logo`, `vendor.document`); only an endpoint expecting this purpose accepts the file.',
  })
  purpose!: string;

  @ApiProperty({
    enum: ['public', 'private'],
    example: 'public',
    description:
      'Who can read the file, decided by the purpose. `public` (product images, logos): anyone, at a stable URL the endpoints that show the file return. `private` (vendor application documents): only through a short-lived link the API gives to those allowed.',
  })
  visibility!: 'public' | 'private';

  @ApiProperty({
    enum: ['ready'],
    example: 'ready',
    description:
      'Always `ready` here: the file passed the checks and can be used.',
  })
  status!: 'ready';

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    example: 482133,
    description:
      'The size of the file in bytes, at least 1 and at most the limit of its purpose.',
  })
  sizeBytes!: number;

  @ApiProperty({
    description:
      'The MIME type read from the file content itself; equal to the `contentType` declared for the ticket.',
    example: 'image/jpeg',
  })
  contentType!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'نعيمي-كامل.jpg',
    description:
      'The file name sent with the ticket request, cleaned up for display (no folders, no control characters, at most 200 characters). Null when none was sent or nothing usable was left.',
  })
  originalFileName!: string | null;

  @ApiProperty({
    example: '2026-11-15T10:01:00.000Z',
    description:
      'When the file was confirmed (UTC, ISO 8601): the first successful confirmation.',
  })
  confirmedAt!: Date;
}
