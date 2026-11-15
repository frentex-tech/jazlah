import { ApiProperty } from '@nestjs/swagger';
import type { VendorApplicationStatus } from '../../domain/vendor-application-status.type';
import { VENDOR_APPLICATION_STATUSES } from '../../domain/vendor-application-statuses.constants';
import { GeoPointDto } from './geo-point.dto';
import { LocalizedTextResponseDto } from './localized-text-response.dto';
import { OptionalLocalizedTextResponseDto } from './optional-localized-text-response.dto';
import { VendorApplicationDocumentResponseDto } from './vendor-application-document-response.dto';

/** A vendor application and its review. The IBAN is only ever shown masked. */
export class VendorApplicationResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: '5b1d9e2a-3c4f-4a6b-8d7e-9f0a1b2c3d4e',
  })
  applicantId!: string;

  @ApiProperty({ enum: VENDOR_APPLICATION_STATUSES, example: 'pending' })
  status!: VendorApplicationStatus;

  @ApiProperty({ type: LocalizedTextResponseDto })
  name!: LocalizedTextResponseDto;

  @ApiProperty({ type: OptionalLocalizedTextResponseDto })
  description!: OptionalLocalizedTextResponseDto;

  @ApiProperty({ example: '1010123456' })
  commercialRegistrationNumber!: string;

  @ApiProperty({
    description:
      'The IBAN with every character hidden but the country and the last four.',
    example: 'SA** **** **** **** **** 7519',
  })
  ibanMasked!: string;

  @ApiProperty({ example: 'مؤسسة النخبة للحوم' })
  accountHolderName!: string;

  @ApiProperty({ type: GeoPointDto })
  location!: GeoPointDto;

  @ApiProperty({ type: [VendorApplicationDocumentResponseDto] })
  documents!: VendorApplicationDocumentResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Why it was rejected; null unless rejected.',
    example: null,
  })
  rejectionReason!: string | null;

  @ApiProperty({ type: Date, nullable: true, example: null })
  reviewedAt!: Date | null;

  @ApiProperty({ example: '2026-11-15T10:00:00.000Z' })
  createdAt!: Date;
}
