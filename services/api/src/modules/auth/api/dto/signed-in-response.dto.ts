import { ApiProperty } from '@nestjs/swagger';
import { AuthTokensResponseDto } from './auth-tokens-response.dto';
import { PrincipalResponseDto } from './principal-response.dto';

/** A successful sign-in: the tokens, and who signed in. */
export class SignedInResponseDto extends AuthTokensResponseDto {
  @ApiProperty({
    type: PrincipalResponseDto,
    description: 'Who signed in, for which audience and session.',
  })
  principal!: PrincipalResponseDto;

  @ApiProperty({
    type: Boolean,
    nullable: true,
    description:
      "Whether the customer's profile is complete (has a full name): when false the app may show the completion screen, which the customer can skip. Null for vendor, kitchen and admin sign-ins.",
    example: false,
  })
  profileComplete!: boolean | null;
}
