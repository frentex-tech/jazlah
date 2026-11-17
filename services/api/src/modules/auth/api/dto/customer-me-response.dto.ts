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
    example: '6f1c0c53-3f0b-4d0a-9a6f-2f0f0f8f7a11',
  })
  userId!: string;

  @ApiProperty({
    description: "The customer's own phone number, in full (E.164).",
    example: '+966512345678',
  })
  phone!: string;

  @ApiProperty({ enum: ['customer'], example: 'customer' })
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
    example: '0b9f6a0e-58e5-4f6b-8e0a-5a1d3d0c2b10',
  })
  sessionId!: string;

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
  preferredLanguage!: string;

  @ApiProperty({
    description:
      'Whether the profile has a full name. The app may be used without it; placing an order will require it.',
    example: true,
  })
  profileComplete!: boolean;

  @ApiProperty({ type: MarketingConsentResponseDto })
  marketingConsent!: MarketingConsentResponseDto;
}
