import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { Audience } from '@common/auth/audience.type';
import { AUDIENCES } from '@common/auth/audiences.constants';
import { SaudiMobileNumber } from '@common/phone/saudi-mobile-number.decorator';
import { removeFormatCharacters } from '@common/text/remove-format-characters';
import { toLatinDigits } from '@common/text/to-latin-digits';
import type { DevicePlatform } from '../../domain/device-platform.type';
import { DEVICE_PLATFORMS } from '../../domain/device-platforms.constants';

/** The body of a sign-in: the phone, the audience, the code and the device. */
export class VerifyOtpDto {
  @ApiProperty({
    description:
      'The phone number the code was requested for, in any form the request accepted (05…, 5…, 9665…, +9665…; Latin or Arabic digits).',
    example: '0512345678',
  })
  @SaudiMobileNumber()
  phone!: string;

  @ApiProperty({
    enum: AUDIENCES,
    description:
      'The audience the code was requested for; a code works only for its own audience.',
    example: 'customer',
  })
  @IsIn(AUDIENCES)
  audience!: Audience;

  @ApiProperty({
    description:
      'The code from the message: 4 to 8 digits, Latin or Arabic (٠ to ٩, ۰ to ۹). Surrounding spaces and invisible format characters (direction marks, zero-width characters) are ignored. The SMS code has 6 digits by default.',
    example: '482913',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? toLatinDigits(removeFormatCharacters(value).trim())
      : value,
  )
  @Matches(/^\d{4,8}$/)
  code!: string;

  @ApiProperty({
    enum: DEVICE_PLATFORMS,
    description:
      'The kind of client signing in: `ios` or `android` for the customer app, `web` for the dashboards and the customer web.',
    example: 'ios',
  })
  @IsIn(DEVICE_PLATFORMS)
  devicePlatform!: DevicePlatform;

  @ApiPropertyOptional({
    description:
      'An optional name for the device (1 to 100 characters), stored with the session to tell sessions apart.',
    example: 'iPhone 16',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  deviceName?: string;
}
