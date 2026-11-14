import { ApiProperty } from '@nestjs/swagger';
import type { Audience } from '@common/auth/audience.type';
import { AUDIENCES } from '@common/auth/audiences.constants';

/** Who is signed in. */
export class PrincipalResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '6f1c0c53-3f0b-4d0a-9a6f-2f0f0f8f7a11',
  })
  userId!: string;

  @ApiProperty({
    description: 'The phone number, masked.',
    example: '+966*******78',
  })
  phone!: string;

  @ApiProperty({
    enum: AUDIENCES,
    description: 'The one audience this sign-in is for.',
    example: 'customer',
  })
  audience!: Audience;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'The vendor or kitchen the user acts for; null for customers and admins.',
    example: null,
  })
  organisationId!: string | null;

  @ApiProperty({
    format: 'uuid',
    example: '0b9f6a0e-58e5-4f6b-8e0a-5a1d3d0c2b10',
  })
  sessionId!: string;
}
