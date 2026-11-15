import { ApiProperty } from '@nestjs/swagger';
import { VendorApplicationDocumentResponseDto } from './vendor-application-document-response.dto';

/** A document of an application with where to read it, for the admin reviewing it. */
export class VendorApplicationDocumentLinkResponseDto extends VendorApplicationDocumentResponseDto {
  @ApiProperty({
    description: 'A presigned URL: the documents are private.',
    example: 'https://storage.example.com/jazla-private/vendor/document/…',
  })
  url!: string;

  @ApiProperty({
    type: Date,
    nullable: true,
    description: 'When the URL stops working.',
    example: '2026-11-15T10:05:00.000Z',
  })
  expiresAt!: Date | null;
}
