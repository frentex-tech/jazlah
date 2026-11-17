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
 *
 * shortNationalAddress documents no `pattern`: the input may be lowercase, spaced or
 * in Arabic digits; the pattern is the stored form, documented on the response.
 */
export class CustomerAddressTextDto {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: CUSTOMER_LIMITS.addressFieldMax,
    description: `The city, up to ${CUSTOMER_LIMITS.addressFieldMax} characters; surrounding spaces removed. Optional: left out, null or blank means none. In an update, left out keeps the current value and null or blank clears it.`,
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
    description: `The district (neighbourhood), up to ${CUSTOMER_LIMITS.addressFieldMax} characters; surrounding spaces removed. Optional: left out, null or blank means none. In an update, left out keeps the current value and null or blank clears it.`,
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
    description: `The street, up to ${CUSTOMER_LIMITS.addressFieldMax} characters; surrounding spaces removed. Optional: left out, null or blank means none. In an update, left out keeps the current value and null or blank clears it.`,
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
    description: `Building number, floor, apartment, as free text up to ${CUSTOMER_LIMITS.addressFieldMax} characters; surrounding spaces removed. Optional: left out, null or blank means none. In an update, left out keeps the current value and null or blank clears it.`,
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
    description:
      'The Saudi short national address (Saudi Post): four letters then four digits. Spaces, lowercase and Arabic digits are accepted (`rrrd 2929`, `RRRD٢٩٢٩`) and it is stored and returned as `RRRD2929`; any other form is VALIDATION_FAILED. Optional: left out, null or blank means none. In an update, left out keeps the current value and null or blank clears it.',
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
    description: `Notes for the driver (which door, call before arriving), up to ${CUSTOMER_LIMITS.driverInstructionsMax} characters; surrounding spaces removed. Optional: left out, null or blank means none. In an update, left out keeps the current value and null or blank clears it.`,
    example: 'الباب الجانبي، اتصل قبل الوصول',
  })
  @Transform(toOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(CUSTOMER_LIMITS.driverInstructionsMax)
  driverInstructions?: string | null;
}
