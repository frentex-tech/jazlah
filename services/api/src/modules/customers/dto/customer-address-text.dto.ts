import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { toOptionalText } from '@common/dto/to-optional-text';
import { CUSTOMER_LIMITS } from '../customer-limits.constants';
import { SHORT_NATIONAL_ADDRESS } from '../short-national-address.constants';
import { toShortNationalAddress } from './to-short-national-address';

/**
 * The readable parts of an address, all optional: the app fills them from the map
 * (reverse geocoding) and the customer may edit them. Blank or null is "none"; in an
 * update, null clears the field and leaving it out keeps it.
 */
export class CustomerAddressTextDto {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: CUSTOMER_LIMITS.addressFieldMax,
    example: 'الرياض',
  })
  @Transform(toOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(CUSTOMER_LIMITS.addressFieldMax)
  city?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: CUSTOMER_LIMITS.addressFieldMax,
    example: 'حي الملقا',
  })
  @Transform(toOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(CUSTOMER_LIMITS.addressFieldMax)
  district?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: CUSTOMER_LIMITS.addressFieldMax,
    example: 'طريق أنس بن مالك',
  })
  @Transform(toOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(CUSTOMER_LIMITS.addressFieldMax)
  street?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: CUSTOMER_LIMITS.addressFieldMax,
    description: 'Building number, floor, apartment.',
    example: 'مبنى 4321، الدور الثاني، شقة 5',
  })
  @Transform(toOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(CUSTOMER_LIMITS.addressFieldMax)
  building?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    pattern: SHORT_NATIONAL_ADDRESS.source,
    description:
      'The Saudi short national address: four letters then four digits. Spaces, lowercase and Arabic digits are accepted and stored as `ABCD1234`.',
    example: 'RRRD2929',
  })
  @Transform(toShortNationalAddress)
  @IsOptional()
  @IsString()
  @Matches(SHORT_NATIONAL_ADDRESS)
  shortNationalAddress?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: CUSTOMER_LIMITS.driverInstructionsMax,
    example: 'الباب الجانبي، اتصل قبل الوصول',
  })
  @Transform(toOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(CUSTOMER_LIMITS.driverInstructionsMax)
  driverInstructions?: string | null;
}
