import { ApiProperty } from '@nestjs/swagger';
import {
  MarketingConsentResponseDto,
  PREFERRED_LANGUAGES,
} from '@modules/customers';

/**
 * The signed-in customer: who they are, their own phone number in full (the only
 * response that shows it unmasked), their profile and their marketing consent.
 */
export class CustomerMeResponseDto {
  @ApiProperty({
    format: 'uuid',
    description: 'The customer (user id, UUID).',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  userId!: string;

  @ApiProperty({
    description:
      "The customer's own phone number, in full, in E.164 (`+9665` and 8 digits). For the profile screen.",
    example: '+966512345678',
  })
  phone!: string;

  @ApiProperty({
    enum: ['customer'],
    description: 'The audience of this sign-in: always `customer` here.',
    example: 'customer',
  })
  audience!: 'customer';

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Always null for a customer.',
    example: null,
  })
  organisationId!: string | null;

  @ApiProperty({
    format: 'uuid',
    description:
      'The session (UUID): this sign-in on this device, ended by signing out.',
    example: '0b9f6a0e-58e5-4f6b-8e0a-5a1d3d0c2b10',
  })
  sessionId!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The full name as the customer typed it; null until the customer gives one.',
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
      'The language of messages sent to the customer (SMS, notifications): `ar` (the default) or `en`.',
    example: 'ar',
  })
  preferredLanguage!: string;

  @ApiProperty({
    description:
      'Whether the profile has a full name. The app may be used without it; placing an order will require it.',
    example: true,
  })
  profileComplete!: boolean;

  @ApiProperty({
    type: MarketingConsentResponseDto,
    description: 'Whether the customer agreed to receive marketing messages.',
  })
  marketingConsent!: MarketingConsentResponseDto;
}
