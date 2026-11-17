import { ApiProperty } from '@nestjs/swagger';
import { VendorApplicationDocumentResponseDto } from './vendor-application-document-response.dto';

/** A document of an application with where to read it, for the admin reviewing it. */
export class VendorApplicationDocumentLinkResponseDto extends VendorApplicationDocumentResponseDto {
  @ApiProperty({
    description:
      'A presigned URL to open the file (the documents are private). It stops working at expiresAt: read the application again for a fresh one; never store it.',
    example:
      'https://storage.example.com/jazla-private/vendor/document/2026/11/15/7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b/2c9d4e1f-6a7b-4c8d-9e0f-1a2b3c4d5e6f?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=300&X-Amz-Signature=3f2a',
  })
  url!: string;

  @ApiProperty({
    type: Date,
    nullable: true,
    description:
      'When the URL stops working, UTC ISO 8601 (a few minutes after the read); null if the file is public and its URL does not expire.',
    example: '2026-11-15T10:05:00.000Z',
  })
  expiresAt!: Date | null;
}
