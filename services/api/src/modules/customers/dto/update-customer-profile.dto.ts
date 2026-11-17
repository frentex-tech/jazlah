import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { CUSTOMER_LIMITS } from '../customer-limits.constants';
import type { PreferredLanguage } from '../preferred-language.type';
import { PREFERRED_LANGUAGES } from '../preferred-languages.constants';
import { toEmail } from './to-email';
import { toPersonName } from './to-person-name';

/** Changes to the signed-in customer's profile; a field left out stays as it is. */
export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({
    minLength: CUSTOMER_LIMITS.fullName.min,
    maxLength: CUSTOMER_LIMITS.fullName.max,
    description:
      'The full name; the profile is complete once it has one. It cannot be removed.',
    example: 'محمد العتيبي',
  })
  @Transform(toPersonName)
  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  @MinLength(CUSTOMER_LIMITS.fullName.min)
  @MaxLength(CUSTOMER_LIMITS.fullName.max)
  fullName?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: CUSTOMER_LIMITS.emailMax,
    description:
      'Stored lowercase and not verified; null (or blank) removes it.',
    example: 'mohammed@example.com',
  })
  @Transform(toEmail)
  @ValidateIf((_dto, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(CUSTOMER_LIMITS.emailMax)
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({
    enum: PREFERRED_LANGUAGES,
    description: 'The language of messages to this customer.',
    example: 'ar',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsIn(PREFERRED_LANGUAGES)
  preferredLanguage?: PreferredLanguage;
}
