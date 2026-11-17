import { ApiProperty, OmitType } from '@nestjs/swagger';
import { VendorApplicationDocumentLinkResponseDto } from './vendor-application-document-link-response.dto';
import { VendorApplicationResponseDto } from './vendor-application-response.dto';

/** An application for the admin reviewing it: with who reviewed it and a link to each document. */
export class VendorApplicationDetailResponseDto extends OmitType(
  VendorApplicationResponseDto,
  ['documents'] as const,
) {
  @ApiProperty({
    type: [VendorApplicationDocumentLinkResponseDto],
    description:
      'The attached documents, each with a short-lived link to open it.',
  })
  documents!: VendorApplicationDocumentLinkResponseDto[];

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'The admin (user UUID) who approved or rejected it; null while pending.',
    example: null,
  })
  reviewedById!: string | null;
}
