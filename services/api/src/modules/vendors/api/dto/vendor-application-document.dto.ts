import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import type { VendorApplicationDocumentKind } from '../../domain/vendor-application-document-kind.type';
import { VENDOR_APPLICATION_DOCUMENT_KINDS } from '../../domain/vendor-application-document-kinds.constants';

/** A document attached to an application: a confirmed `vendor.document` upload of the applicant. */
export class VendorApplicationDocumentDto {
  @ApiProperty({
    enum: VENDOR_APPLICATION_DOCUMENT_KINDS,
    description:
      'What the document shows: commercial_registration, health_certificate or facility_photo.',
    example: 'commercial_registration',
  })
  @IsIn(VENDOR_APPLICATION_DOCUMENT_KINDS)
  kind!: VendorApplicationDocumentKind;

  @ApiProperty({
    format: 'uuid',
    description:
      'The id (UUID) of a file the signed-in customer uploaded with purpose vendor.document and confirmed (PDF, JPEG or PNG, up to 10 MB).',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  @IsUUID()
  mediaId!: string;
}
