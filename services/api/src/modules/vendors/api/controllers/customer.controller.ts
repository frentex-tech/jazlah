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
import { CUSTOMER_AUTH_ERRORS } from '@common/decorators/customer-auth-errors.constants';
import { ErrorCode } from '@common/errors/error-code.enum';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { GetLatestVendorApplicationUseCase } from '../../application/get-latest-vendor-application.use-case';
import { SubmitVendorApplicationUseCase } from '../../application/submit-vendor-application.use-case';
import { SubmitVendorApplicationDto } from '../dto/submit-vendor-application.dto';
import { VendorApplicationResponseDto } from '../dto/vendor-application-response.dto';
import { toVendorApplicationResponse } from '../to-vendor-application-response';

/** A customer applying to become a vendor, and following the application. */
@ApiTags(API_TAGS.customerVendorApplications.name)
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('customer/vendor-applications')
export class CustomerVendorsController {
  constructor(
    private readonly submitApplication: SubmitVendorApplicationUseCase,
    private readonly getLatestApplication: GetLatestVendorApplicationUseCase,
  ) {}

  @Post()
  @ApiOperation({
    operationId: 'customerSubmitVendorApplication',
    summary: 'Apply to become a vendor',
    description: [
      'Customer app, "sell on JAZLA" form: the signed-in customer applies to become a vendor. The application is created pending and waits for an admin; nothing is published until it is approved, when the applicant gets vendor access and signs in to the vendor dashboard with the same phone number.',
      'Before sending, upload each document (POST /v1/customer/media/uploads, purpose vendor.document: PDF, JPEG or PNG up to 10 MB) and confirm it (POST /v1/customer/media/{id}/confirm). Send at least one document of each kind (commercial_registration, health_certificate, facility_photo), each file once, at most 10 in all. The IBAN is checked as a Saudi IBAN and never returned in full.',
      'Errors: VALIDATION_FAILED names the field (documents with requiresEachDocumentKind, uniqueFiles or arrayMaxSize; iban with isSaudiIban). MEDIA_NOT_FOUND (details.mediaId): no such file uploaded by this user with purpose vendor.document. MEDIA_NOT_READY (details.mediaId): the upload was not confirmed. VENDOR_APPLICATION_ALREADY_PENDING: one application is already waiting; show it (GET latest) instead. VENDOR_ACCESS_ALREADY_HELD: this user already works for a vendor. UNAUTHORIZED also when the account was deleted. TRANSACTION_CONFLICT: send again.',
    ].join('\n\n'),
  })
  @ApiCreatedResponse({
    type: VendorApplicationResponseDto,
    description: 'The new application, pending.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.MEDIA_NOT_FOUND,
    ErrorCode.MEDIA_NOT_READY,
    ErrorCode.VENDOR_APPLICATION_ALREADY_PENDING,
    ErrorCode.VENDOR_ACCESS_ALREADY_HELD,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
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
          vatNumber: body.vatNumber ?? null,
          city: body.city,
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
    operationId: 'customerGetLatestVendorApplication',
    summary: 'My newest vendor application',
    description: [
      'Customer app, "sell on JAZLA" screen: the signed-in customer’s most recent application, to show where its review is. pending: waiting for an admin. approved: sign in to the vendor dashboard. rejected: show rejectionReason and offer to apply again.',
      'NOT_FOUND when this customer never applied: show the application form.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: VendorApplicationResponseDto,
    description: 'The customer’s newest application, in any status.',
  })
  @ApiErrorResponses(
    ErrorCode.NOT_FOUND,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...CUSTOMER_AUTH_ERRORS,
  )
  async latest(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VendorApplicationResponseDto> {
    return toVendorApplicationResponse(
      await this.getLatestApplication.execute(user.userId),
    );
  }
}
