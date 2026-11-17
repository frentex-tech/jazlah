import { ApiProperty } from '@nestjs/swagger';
import { CUSTOMER_LIMITS } from '../customer-limits.constants';
import type { PreferredLanguage } from '../preferred-language.type';
import { PREFERRED_LANGUAGES } from '../preferred-languages.constants';

/** The signed-in customer's profile. */
export class CustomerProfileResponseDto {
  @ApiProperty({
    type: String,
    nullable: true,
    description: `The customer's full name, ${CUSTOMER_LIMITS.fullName.min} to ${CUSTOMER_LIMITS.fullName.max} characters; null until the customer gives one.`,
    example: 'محمد العتيبي',
  })
  fullName!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The email address, lowercase and not verified; null when the customer gave none or removed it.',
    example: 'mohammed@example.com',
  })
  email!: string | null;

  @ApiProperty({
    enum: PREFERRED_LANGUAGES,
    description:
      'The language of messages to this customer: `ar` (Arabic, the default until the customer chooses) or `en`.',
    example: 'ar',
  })
  preferredLanguage!: PreferredLanguage;

  @ApiProperty({
    description:
      'Whether the profile has a full name. The app may be used without it; placing an order will require it.',
    example: true,
  })
  isComplete!: boolean;
}
