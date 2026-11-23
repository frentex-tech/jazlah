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
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
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
@ApiTags(API_TAGS.publicAuth.name)
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
    operationId: 'publicRequestOtp',
    summary: 'Send a verification code to a phone number',
    description:
      'Step 1 of signing in, from the phone number screen of every app: the customer app sends `audience: customer`, the vendor, kitchen and admin dashboards their own audience. The code arrives by SMS (in the language of `Accept-Language`, Arabic by default); the app then shows the code screen and calls `POST /v1/public/auth/otp/verify` with the same phone and audience.\n\n' +
      'The answer is the same whether or not the phone may sign in to a staff audience (vendor, kitchen, admin): a phone without that access gets the same 200 but no SMS, and any code it sends is then refused as OTP_INVALID. A new code replaces the previous one, which stops working. Phones set up for app-store review receive no SMS and sign in with the fixed code given to the reviewer.\n\n' +
      'Errors:\n' +
      '- RATE_LIMITED (429, `Retry-After` in seconds): asked again before `resendAfterSeconds` passed, too many codes for this phone and audience (3 per 10 minutes by default; customers also 10 per day), or too many requests from this network address. Show a countdown from `Retry-After`.\n' +
      '- SERVICE_UNAVAILABLE (503): the SMS could not be sent, or the limits cannot be checked right now. No code was sent; the user may try again shortly.',
  })
  @ApiOkResponse({
    type: OtpRequestedResponseDto,
    description:
      'The code was issued (or the request was answered as if it had been): show the code screen.',
  })
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
    operationId: 'publicVerifyOtp',
    summary: 'Sign in with the verification code',
    description:
      'Step 2 of signing in, from the code screen of every app: exchanges the code sent by `POST /v1/public/auth/otp/request` for an access token and a refresh token of that one audience. Only the newest code of the phone and audience works, once, before it expires, and for a limited number of attempts (5 by default). A customer signing in for the first time gets a new account; staff need access granted by an admin.\n\n' +
      'Keep the refresh token in secure storage and send the access token as `Authorization: Bearer <token>`. For a customer, `profileComplete` false means the app may show the profile completion screen (skippable).\n\n' +
      'Errors:\n' +
      '- OTP_INVALID (422): the code is wrong, or the phone has no access to this staff audience. The attempt is counted; let the user retype it.\n' +
      '- OTP_EXPIRED (410): no code can be verified any more (none requested, expired, already used, or attempts used up). Ask for a new code.\n' +
      '- ACCOUNT_DISABLED (403): the account is disabled; signing in again will not help (contact support).\n' +
      '- VENDOR_SUSPENDED (403): vendor sign-in only; the store is suspended until an admin reinstates it.\n' +
      '- TRANSACTION_CONFLICT (409): a rare clash with another change to the same account; send the same request again.\n' +
      '- RATE_LIMITED (429): too many attempts from this network address; wait `Retry-After` seconds.\n' +
      '- SERVICE_UNAVAILABLE (503): the limits cannot be checked or the database cannot be reached right now; retry shortly.',
  })
  @ApiOkResponse({
    type: SignedInResponseDto,
    description: 'Signed in: the tokens and who signed in.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.OTP_INVALID,
    ErrorCode.OTP_EXPIRED,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.VENDOR_SUSPENDED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.RATE_LIMITED,
    ErrorCode.SERVICE_UNAVAILABLE,
  )
  async verify(@Body() body: VerifyOtpDto): Promise<SignedInResponseDto> {
    const { tokens, principal, profileComplete } = await this.verifyOtp.execute(
      {
        phone: body.phone,
        audience: body.audience,
        code: body.code,
        devicePlatform: body.devicePlatform,
        deviceName: body.deviceName ?? null,
      },
    );
    return {
      ...tokens,
      principal: toPrincipalResponse(principal),
      profileComplete,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'publicRefreshSession',
    summary: 'Exchange the refresh token for a new pair',
    description:
      'Called by every app when a request answers 401 ACCESS_TOKEN_EXPIRED (or shortly before the access token expires): returns a new access token and a new refresh token for the same session. Store the new refresh token at once: each refresh token works once, and presenting a used one again ends the session for every holder. If the answer to a refresh is lost, the user signs in again, so send one refresh at a time per session.\n\n' +
      'Errors:\n' +
      '- REFRESH_TOKEN_INVALID (401): unknown, expired or already used token, or the session has ended (signed out, account deleted, staff access removed). Go to the sign-in screen; do not retry.\n' +
      '- ACCOUNT_DISABLED (403): the account is disabled and the session has ended; show the support message.\n' +
      '- VENDOR_SUSPENDED (403): vendor sessions only; the store is suspended and the session has ended.\n' +
      '- TRANSACTION_CONFLICT (409): a rare clash with another change to the same session; send the same request again.\n' +
      '- SERVICE_UNAVAILABLE (503): the database cannot be reached; retry shortly with the same refresh token.',
  })
  @ApiOkResponse({
    type: AuthTokensResponseDto,
    description:
      'The new pair. The refresh token sent is now used: keep only the new one.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.REFRESH_TOKEN_INVALID,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.VENDOR_SUSPENDED,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.RATE_LIMITED,
    ErrorCode.SERVICE_UNAVAILABLE,
  )
  async refresh(@Body() body: RefreshTokenDto): Promise<AuthTokensResponseDto> {
    return this.refreshSession.execute(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'publicLogout',
    summary: 'Sign out of the session the refresh token belongs to',
    description:
      'Called by every app on "Sign out": ends the session named by the refresh token, so it works even after the access token has expired; then delete both tokens from the device. Always 204, also for an unknown token or a session already ended. The access token keeps working until it expires (15 minutes by default).',
  })
  @ApiNoContentResponse({
    description: 'Signed out, or there was nothing to sign out of.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.RATE_LIMITED,
    ErrorCode.SERVICE_UNAVAILABLE,
  )
  async logout(@Body() body: RefreshTokenDto): Promise<void> {
    await this.logoutSession.execute(body.refreshToken);
  }
}
