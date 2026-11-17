import { ApiProperty } from '@nestjs/swagger';
import type { PreferredLanguage } from '../preferred-language.type';
import { PREFERRED_LANGUAGES } from '../preferred-languages.constants';

/** The signed-in customer's profile. */
export class CustomerProfileResponseDto {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Null until the customer gives a name.',
    example: 'محمد العتيبي',
  })
  fullName!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'mohammed@example.com',
  })
  email!: string | null;

  @ApiProperty({ enum: PREFERRED_LANGUAGES, example: 'ar' })
  preferredLanguage!: PreferredLanguage;

  @ApiProperty({
    description:
      'Whether the profile has a full name. The app may be used without it; placing an order will require it.',
    example: true,
  })
  isComplete!: boolean;
}
