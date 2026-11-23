import { ApiProperty } from '@nestjs/swagger';
import { GeoPointDto } from '@common/dto/geo-point.dto';
import { COMMISSION_BASIS_POINTS } from '../../domain/commission-basis-points.constants';
import { PublicVendorResponseDto } from './public-vendor-response.dto';

/**
 * A vendor's own profile: what anyone sees, plus its commission, its contact details,
 * and its business and bank details (the IBAN masked). The business fields are null only for the platform
 * vendor.
 */
export class VendorProfileResponseDto extends PublicVendorResponseDto {
  @ApiProperty({
    minimum: COMMISSION_BASIS_POINTS.min,
    maximum: COMMISSION_BASIS_POINTS.max,
    description:
      'The platform commission on future orders, in basis points (an integer, 0 to 10000): 1250 is 12.5%. Orders already placed keep the commission they were placed with.',
    example: 1250,
  })
  commissionBasisPoints!: number;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The commercial registration number, 10 Latin digits; null only for the platform vendor.',
    example: '1010123456',
  })
  commercialRegistrationNumber!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The VAT registration number, 15 Latin digits starting and ending with 3; null when none was given. Not public.',
    example: '310123456700003',
  })
  vatNumber!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The store’s contact number for the platform, in E.164 (a Saudi mobile +9665… or landline +9661…); null until set. Not public.',
    example: '+966112345678',
  })
  contactPhone!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The store’s contact email for the platform, lowercase and not verified; null until set. Not public.',
    example: 'contact@example.com',
  })
  contactEmail!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The payout IBAN with every character hidden but the country and the last four (the full IBAN is never sent); null only for the platform vendor.',
    example: 'SA** **** **** **** **** 7519',
  })
  ibanMasked!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The name on the payout bank account; null only for the platform vendor.',
    example: 'مؤسسة النخبة للحوم',
  })
  accountHolderName!: string | null;

  @ApiProperty({
    type: GeoPointDto,
    nullable: true,
    description:
      'Where the facility is, from the application; null only for the platform vendor.',
  })
  location!: GeoPointDto | null;

  @ApiProperty({
    description:
      'When the vendor was created (its application approved), UTC ISO 8601.',
    example: '2026-11-15T10:00:00.000Z',
  })
  createdAt!: Date;
}
