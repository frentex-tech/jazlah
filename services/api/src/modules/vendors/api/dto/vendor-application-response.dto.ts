import { ApiProperty } from '@nestjs/swagger';
import type { VendorApplicationStatus } from '../../domain/vendor-application-status.type';
import { VENDOR_APPLICATION_STATUSES } from '../../domain/vendor-application-statuses.constants';
import { GeoPointDto } from '@common/dto/geo-point.dto';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { OptionalLocalizedTextResponseDto } from '@common/dto/optional-localized-text-response.dto';
import { VendorApplicationDocumentResponseDto } from './vendor-application-document-response.dto';

/** A vendor application and its review. The IBAN is only ever shown masked. */
export class VendorApplicationResponseDto {
  @ApiProperty({
    format: 'uuid',
    description: 'The application id, a UUID.',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    description: 'The user (UUID) who applied.',
    example: '5b1d9e2a-3c4f-4a6b-8d7e-9f0a1b2c3d4e',
  })
  applicantId!: string;

  @ApiProperty({
    enum: VENDOR_APPLICATION_STATUSES,
    description:
      'pending: waiting for an admin. approved: the vendor exists and the applicant can sign in to the vendor dashboard. rejected: see rejectionReason; the applicant may apply again. An application is reviewed once and never changes after.',
    example: 'pending',
  })
  status!: VendorApplicationStatus;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'The store name in Arabic and English.',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    type: OptionalLocalizedTextResponseDto,
    description:
      'The store description in Arabic and English; either language is null when not written.',
  })
  description!: OptionalLocalizedTextResponseDto;

  @ApiProperty({
    description: 'The commercial registration number, 10 Latin digits.',
    example: '1010123456',
  })
  commercialRegistrationNumber!: string;

  @ApiProperty({
    description:
      'The payout IBAN with every character hidden but the country and the last four; the full IBAN is never sent.',
    example: 'SA** **** **** **** **** 7519',
  })
  ibanMasked!: string;

  @ApiProperty({
    description: 'The name on the payout bank account.',
    example: 'مؤسسة النخبة للحوم',
  })
  accountHolderName!: string;

  @ApiProperty({ type: GeoPointDto, description: 'Where the facility is.' })
  location!: GeoPointDto;

  @ApiProperty({
    type: [VendorApplicationDocumentResponseDto],
    description: 'The attached documents, with their kinds.',
  })
  documents!: VendorApplicationDocumentResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The admin’s reason, written for the applicant to read (1 to 500 characters); null unless rejected.',
    example: null,
  })
  rejectionReason!: string | null;

  @ApiProperty({
    type: Date,
    nullable: true,
    description:
      'When an admin approved or rejected it, UTC ISO 8601; null while pending.',
    example: null,
  })
  reviewedAt!: Date | null;

  @ApiProperty({
    description: 'When it was submitted, UTC ISO 8601.',
    example: '2026-11-15T10:00:00.000Z',
  })
  createdAt!: Date;
}
