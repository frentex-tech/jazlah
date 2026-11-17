import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { CharLength } from '@common/decorators/char-length.decorator';
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
    description: `The customer's full name: ${CUSTOMER_LIMITS.fullName.min} to ${CUSTOMER_LIMITS.fullName.max} characters, counted in Unicode code points (an emoji with a variation selector counts as 2), after invisible format characters are removed and runs of spaces made one. The profile is complete once it has one. Left out keeps the current name; null is VALIDATION_FAILED (a name cannot be removed).`,
    example: 'محمد العتيبي',
  })
  @Transform(toPersonName)
  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  @CharLength(CUSTOMER_LIMITS.fullName.min, CUSTOMER_LIMITS.fullName.max)
  fullName?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: CUSTOMER_LIMITS.emailMax,
    description: `An email address, up to ${CUSTOMER_LIMITS.emailMax} characters; stored lowercase and not verified (two accounts may give the same one). null or blank removes it; left out keeps the current one.`,
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
    description:
      'The language of messages to this customer: `ar` or `en`. Left out keeps the current one; null is VALIDATION_FAILED.',
    example: 'ar',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsIn(PREFERRED_LANGUAGES)
  preferredLanguage?: PreferredLanguage;
}
