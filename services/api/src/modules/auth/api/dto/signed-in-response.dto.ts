import { ApiProperty } from '@nestjs/swagger';
import { AuthTokensResponseDto } from './auth-tokens-response.dto';
import { PrincipalResponseDto } from './principal-response.dto';

/** A successful sign-in: the tokens, and who signed in. */
export class SignedInResponseDto extends AuthTokensResponseDto {
  @ApiProperty({ type: PrincipalResponseDto })
  principal!: PrincipalResponseDto;
}
