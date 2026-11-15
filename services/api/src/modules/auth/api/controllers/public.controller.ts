import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { ErrorCode } from '@common/errors/error-code.enum';
import { resolveLanguage } from '@common/i18n/resolve-language';
import { RateLimit } from '@infra/rate-limit/rate-limit.decorator';
import { LogoutUseCase } from '../../application/logout.use-case';
import { RefreshSessionUseCase } from '../../application/refresh-session.use-case';
import { RequestOtpUseCase } from '../../application/request-otp.use-case';
import { VerifyOtpUseCase } from '../../application/verify-otp.use-case';
import { AuthTokensResponseDto } from '../dto/auth-tokens-response.dto';
import { OtpRequestedResponseDto } from '../dto/otp-requested-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RequestOtpDto } from '../dto/request-otp.dto';
import { SignedInResponseDto } from '../dto/signed-in-response.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { toPrincipalResponse } from '../to-principal-response';

/** Signing in and staying signed in: the endpoints that need no access token. */
@ApiTags('auth')
@Controller('public/auth')
export class PublicAuthController {
  constructor(
    private readonly requestOtp: RequestOtpUseCase,
    private readonly verifyOtp: VerifyOtpUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logoutSession: LogoutUseCase,
  ) {}

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @RateLimit({
    name: 'otp-request',
    failClosed: true,
    from: (limits) => limits.otpRequestAddress,
  })
  @ApiOperation({
    summary: 'Send a verification code to a phone number',
    description:
      'The answer is the same whether or not the phone may sign in to the audience. A new code replaces the previous one. Asking again before `resendAfterSeconds` has passed is RATE_LIMITED with Retry-After.',
  })
  @ApiOkResponse({ type: OtpRequestedResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.RATE_LIMITED,
    ErrorCode.SERVICE_UNAVAILABLE,
  )
  async request(
    @Body() body: RequestOtpDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
  ): Promise<OtpRequestedResponseDto> {
    return this.requestOtp.execute({
      phone: body.phone,
      audience: body.audience,
      language: resolveLanguage(acceptLanguage),
    });
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @RateLimit({
    name: 'otp-verify',
    failClosed: true,
    from: (limits) => limits.otpVerifyAddress,
  })
  @ApiOperation({
    summary: 'Sign in with the verification code',
    description:
      'OTP_INVALID: the code is wrong (the attempt is counted). OTP_EXPIRED: no code can be verified any more; request a new one.',
  })
  @ApiOkResponse({ type: SignedInResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.OTP_INVALID,
    ErrorCode.OTP_EXPIRED,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.RATE_LIMITED,
    ErrorCode.SERVICE_UNAVAILABLE,
  )
  async verify(@Body() body: VerifyOtpDto): Promise<SignedInResponseDto> {
    const { tokens, principal } = await this.verifyOtp.execute({
      phone: body.phone,
      audience: body.audience,
      code: body.code,
      devicePlatform: body.devicePlatform,
      deviceName: body.deviceName ?? null,
    });
    return { ...tokens, principal: toPrincipalResponse(principal) };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exchange the refresh token for a new pair',
    description:
      'Each refresh token works once. Presenting one again ends the session.',
  })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.REFRESH_TOKEN_INVALID,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.RATE_LIMITED,
  )
  async refresh(@Body() body: RefreshTokenDto): Promise<AuthTokensResponseDto> {
    return this.refreshSession.execute(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Sign out of the session the refresh token belongs to',
    description:
      'Always 204, also for an unknown token or a session already ended.',
  })
  @ApiNoContentResponse({ description: 'Signed out.' })
  @ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ErrorCode.RATE_LIMITED)
  async logout(@Body() body: RefreshTokenDto): Promise<void> {
    await this.logoutSession.execute(body.refreshToken);
  }
}
