import { ApiProperty } from '@nestjs/swagger';
import type { VendorApplicationDocumentKind } from '../../domain/vendor-application-document-kind.type';
import { VENDOR_APPLICATION_DOCUMENT_KINDS } from '../../domain/vendor-application-document-kinds.constants';

/** A document attached to an application. */
export class VendorApplicationDocumentResponseDto {
  @ApiProperty({
    enum: VENDOR_APPLICATION_DOCUMENT_KINDS,
    description:
      'What the document shows: the commercial registration, the health certificate, a photo of the facility, the municipality licence or the national id.',
    example: 'health_certificate',
  })
  kind!: VendorApplicationDocumentKind;

  @ApiProperty({
    format: 'uuid',
    description: 'The uploaded file (UUID, purpose vendor.document).',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  mediaId!: string;
}
