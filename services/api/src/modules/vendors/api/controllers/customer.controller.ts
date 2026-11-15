import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ErrorCode } from '@common/errors/error-code.enum';
import { GetLatestVendorApplicationUseCase } from '../../application/get-latest-vendor-application.use-case';
import { SubmitVendorApplicationUseCase } from '../../application/submit-vendor-application.use-case';
import { SubmitVendorApplicationDto } from '../dto/submit-vendor-application.dto';
import { VendorApplicationResponseDto } from '../dto/vendor-application-response.dto';
import { toVendorApplicationResponse } from '../to-vendor-application-response';

/** A customer applying to become a vendor, and following the application. */
@ApiTags('vendors')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer/vendor-applications')
export class CustomerVendorsController {
  constructor(
    private readonly submitApplication: SubmitVendorApplicationUseCase,
    private readonly getLatestApplication: GetLatestVendorApplicationUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Apply to become a vendor',
    description:
      'Upload each document first (POST /v1/customer/media/uploads, purpose vendor.document) and confirm it. One pending application at a time; after a rejection, apply again. VENDOR_ACCESS_ALREADY_HELD when the user already works for a vendor.',
  })
  @ApiCreatedResponse({ type: VendorApplicationResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.MEDIA_NOT_FOUND,
    ErrorCode.MEDIA_NOT_READY,
    ErrorCode.VENDOR_APPLICATION_ALREADY_PENDING,
    ErrorCode.VENDOR_ACCESS_ALREADY_HELD,
    ErrorCode.UNAUTHORIZED,
    ErrorCode.ACCESS_TOKEN_EXPIRED,
    ErrorCode.FORBIDDEN,
    ErrorCode.RATE_LIMITED,
  )
  async submit(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SubmitVendorApplicationDto,
  ): Promise<VendorApplicationResponseDto> {
    return toVendorApplicationResponse(
      await this.submitApplication.execute({
        applicantId: user.userId,
        details: {
          name: { ar: body.name.ar, en: body.name.en },
          description: {
            ar: body.description?.ar ?? null,
            en: body.description?.en ?? null,
          },
          commercialRegistrationNumber: body.commercialRegistrationNumber,
          accountHolderName: body.accountHolderName,
          location: {
            latitude: body.location.latitude,
            longitude: body.location.longitude,
          },
        },
        iban: body.iban,
        documents: body.documents.map((document) => ({
          kind: document.kind,
          mediaId: document.mediaId,
        })),
      }),
    );
  }

  @Get('latest')
  @ApiOperation({
    summary: 'My newest vendor application',
    description: 'NOT_FOUND when I never applied.',
  })
  @ApiOkResponse({ type: VendorApplicationResponseDto })
  @ApiErrorResponses(
    ErrorCode.NOT_FOUND,
    ErrorCode.UNAUTHORIZED,
    ErrorCode.ACCESS_TOKEN_EXPIRED,
    ErrorCode.FORBIDDEN,
    ErrorCode.RATE_LIMITED,
  )
  async latest(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VendorApplicationResponseDto> {
    return toVendorApplicationResponse(
      await this.getLatestApplication.execute(user.userId),
    );
  }
}
