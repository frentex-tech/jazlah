import { ApiProperty } from '@nestjs/swagger';
import type { Audience } from '@common/auth/audience.type';
import { AUDIENCES } from '@common/auth/audiences.constants';

/** Who is signed in. */
export class PrincipalResponseDto {
  @ApiProperty({
    format: 'uuid',
    description:
      'The user (UUID). The same person has one user id in every app.',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  userId!: string;

  @ApiProperty({
    description:
      'The phone number, masked: the country code and the last two digits only.',
    example: '+966*******78',
  })
  phone!: string;

  @ApiProperty({
    enum: AUDIENCES,
    description:
      'The one audience this sign-in is for: its tokens work only on the routes of that audience (`/v1/<audience>/...`).',
    example: 'customer',
  })
  audience!: Audience;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'The vendor or kitchen the user acts for (UUID); null for customers and admins.',
    example: null,
  })
  organisationId!: string | null;

  @ApiProperty({
    format: 'uuid',
    description:
      'The session (UUID): one sign-in on one device, ended by signing out.',
    example: '0b9f6a0e-58e5-4f6b-8e0a-5a1d3d0c2b10',
  })
  sessionId!: string;
}
