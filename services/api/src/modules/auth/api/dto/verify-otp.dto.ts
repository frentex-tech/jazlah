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

export class VerifyOtpDto {
  @ApiProperty({
    description: 'The phone number the code was requested for.',
    example: '0512345678',
  })
  @SaudiMobileNumber()
  phone!: string;

  @ApiProperty({
    enum: AUDIENCES,
    description: 'The audience the code was requested for.',
    example: 'customer',
  })
  @IsIn(AUDIENCES)
  audience!: Audience;

  @ApiProperty({
    description:
      'The code from the message: 4 to 8 digits, Latin or Arabic (٠ to ٩, ۰ to ۹). Surrounding spaces and invisible format characters (direction marks, zero-width characters) are ignored.',
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
    description: 'The kind of client signing in.',
    example: 'ios',
  })
  @IsIn(DEVICE_PLATFORMS)
  devicePlatform!: DevicePlatform;

  @ApiPropertyOptional({
    description: 'A name for the device, shown in the list of sessions.',
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
