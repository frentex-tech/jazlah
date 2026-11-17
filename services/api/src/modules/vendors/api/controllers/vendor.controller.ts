import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { VENDOR_AUTH_ERRORS } from '@common/decorators/vendor-auth-errors.constants';
import { ErrorCode } from '@common/errors/error-code.enum';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { GetVendorUseCase } from '../../application/get-vendor.use-case';
import { UpdateOwnVendorProfileUseCase } from '../../application/update-own-vendor-profile.use-case';
import { UpdateVendorProfileDto } from '../dto/update-vendor-profile.dto';
import { VendorProfileResponseDto } from '../dto/vendor-profile-response.dto';
import { organisationOf } from '@common/auth/organisation-of';
import { toVendorProfileChanges } from '../to-vendor-profile-changes';
import { toVendorProfileResponse } from '../to-vendor-profile-response';

/**
 * A vendor's own profile. The vendor is always the access token's organisation, never
 * an id from the request, so a vendor can read and change only its own.
 */
@ApiTags(API_TAGS.vendorProfile.name)
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('vendor/profile')
export class VendorVendorsController {
  constructor(
    private readonly getVendor: GetVendorUseCase,
    private readonly updateProfile: UpdateOwnVendorProfileUseCase,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'vendorGetProfile',
    summary: 'My store profile',
    description: [
      'Vendor dashboard, store profile screen: the store the signed-in vendor user works for (always the one in the access token), with its logo, descriptions, commission in basis points and business and bank details (the IBAN masked).',
      'The name, commercial registration, bank details and location come from the approved application and only an admin can change them; the vendor changes the logo and descriptions (PATCH). VENDOR_SUSPENDED: the store is suspended; sign the user out and explain.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: VendorProfileResponseDto,
    description: 'The vendor’s own profile.',
  })
  @ApiErrorResponses(ErrorCode.SERVICE_UNAVAILABLE, ...VENDOR_AUTH_ERRORS)
  async read(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VendorProfileResponseDto> {
    return toVendorProfileResponse(
      await this.getVendor.execute(organisationOf(user)),
    );
  }

  @Patch()
  @ApiOperation({
    operationId: 'vendorUpdateProfile',
    summary: 'Change my logo or descriptions',
    description: [
      'Vendor dashboard, store profile screen: the vendor changes its own logo and descriptions. Applied at once, with no review; customers see the change on the next read.',
      'For a new logo, upload it first (POST /v1/vendor/media/uploads, purpose vendor.logo: JPEG, PNG or WebP up to 2 MB), confirm it (POST /v1/vendor/media/{id}/confirm), then send its id. A field left out stays as it is; logoMediaId null removes the logo; inside description, a language set to null or blank clears it. An empty body changes nothing.',
      'Errors: MEDIA_NOT_FOUND (details.mediaId): no vendor.logo file uploaded by this user with that id. MEDIA_NOT_READY: the upload was not confirmed.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: VendorProfileResponseDto,
    description: 'The profile after the change.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.MEDIA_NOT_FOUND,
    ErrorCode.MEDIA_NOT_READY,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...VENDOR_AUTH_ERRORS,
  )
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateVendorProfileDto,
  ): Promise<VendorProfileResponseDto> {
    return toVendorProfileResponse(
      await this.updateProfile.execute({
        vendorId: organisationOf(user),
        userId: user.userId,
        changes: toVendorProfileChanges(body),
      }),
    );
  }
}
