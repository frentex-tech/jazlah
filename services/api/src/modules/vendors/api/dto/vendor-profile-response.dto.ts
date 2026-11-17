import { ApiProperty } from '@nestjs/swagger';
import { GeoPointDto } from '@common/dto/geo-point.dto';
import { PublicVendorResponseDto } from './public-vendor-response.dto';

/**
 * A vendor's own profile: what anyone sees, plus its commission and its business and
 * bank details (the IBAN masked). The business fields are null only for the platform
 * vendor.
 */
export class VendorProfileResponseDto extends PublicVendorResponseDto {
  @ApiProperty({
    description: 'Basis points on future orders: 1250 is 12.5%.',
    example: 1250,
  })
  commissionBasisPoints!: number;

  @ApiProperty({ type: String, nullable: true, example: '1010123456' })
  commercialRegistrationNumber!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The IBAN with every character hidden but the country and the last four.',
    example: 'SA** **** **** **** **** 7519',
  })
  ibanMasked!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'مؤسسة النخبة للحوم' })
  accountHolderName!: string | null;

  @ApiProperty({ type: GeoPointDto, nullable: true })
  location!: GeoPointDto | null;

  @ApiProperty({ example: '2026-11-15T10:00:00.000Z' })
  createdAt!: Date;
}
