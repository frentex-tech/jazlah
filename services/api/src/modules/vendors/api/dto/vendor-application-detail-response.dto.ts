import { ApiProperty, OmitType } from '@nestjs/swagger';
import { VendorApplicationDocumentLinkResponseDto } from './vendor-application-document-link-response.dto';
import { VendorApplicationResponseDto } from './vendor-application-response.dto';

/** An application for the admin reviewing it: with who reviewed it and a link to each document. */
export class VendorApplicationDetailResponseDto extends OmitType(
  VendorApplicationResponseDto,
  ['documents'] as const,
) {
  @ApiProperty({ type: [VendorApplicationDocumentLinkResponseDto] })
  documents!: VendorApplicationDocumentLinkResponseDto[];

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'The admin who approved or rejected it; null while pending.',
    example: null,
  })
  reviewedById!: string | null;
}
