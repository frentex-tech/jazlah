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
    description:
      'The id of the file (UUID). Confirm it with `POST .../media/{mediaId}/confirm` once uploaded; once confirmed, it is the id to give the endpoint that uses the file.',
  })
  mediaId!: string;

  @ApiProperty({
    example: 'https://storage.example.com/jazla-private',
    description:
      'Where to upload the file: send `POST` to this URL as `multipart/form-data`, with `fields` and then the file. It is the storage, not this API: send no Authorization header.',
  })
  url!: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    description:
      'The form fields of the upload, each sent as one text part with its name and value exactly as given, all before the file; then the file as the last part, named `file`. The names depend on the storage (the object key, the declared Content-Type, the signed policy and its signature): send every entry, add none and change none, or the storage refuses the upload.',
    example: {
      bucket: 'jazla-private',
      key: 'staging/catalog/product-image/2026/11/15/7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
      'Content-Type': 'image/jpeg',
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': '…/20261115/…/s3/aws4_request',
      'X-Amz-Date': '20261115T100000Z',
      Policy: '…',
      'X-Amz-Signature': '…',
    },
  })
  fields!: Record<string, string>;

  @ApiProperty({
    example: '2026-11-15T10:05:00.000Z',
    description:
      'Until when the storage accepts the upload (UTC, ISO 8601): 5 minutes after the request by default, a server setting. Until then the ticket may be used again; the last upload replaces the earlier one. After it, request a new ticket.',
  })
  expiresAt!: Date;

  @ApiProperty({
    example: '2026-11-15T11:00:00.000Z',
    description:
      'The last moment the upload may be confirmed (UTC, ISO 8601): 1 hour after the request by default, a server setting, always after `expiresAt`. Past it, confirmation answers MEDIA_UPLOAD_EXPIRED and the upload is removed.',
  })
  confirmBy!: Date;
}
