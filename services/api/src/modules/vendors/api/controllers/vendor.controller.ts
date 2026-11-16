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
import { ErrorCode } from '@common/errors/error-code.enum';
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
@ApiTags('vendors')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('vendor/profile')
export class VendorVendorsController {
  constructor(
    private readonly getVendor: GetVendorUseCase,
    private readonly updateProfile: UpdateOwnVendorProfileUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'My store profile' })
  @ApiOkResponse({ type: VendorProfileResponseDto })
  @ApiErrorResponses(
    ErrorCode.NOT_FOUND,
    ErrorCode.UNAUTHORIZED,
    ErrorCode.ACCESS_TOKEN_EXPIRED,
    ErrorCode.FORBIDDEN,
    ErrorCode.VENDOR_SUSPENDED,
    ErrorCode.RATE_LIMITED,
  )
  async read(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VendorProfileResponseDto> {
    return toVendorProfileResponse(
      await this.getVendor.execute(organisationOf(user)),
    );
  }

  @Patch()
  @ApiOperation({
    summary: 'Change my logo or descriptions',
    description:
      'Upload a logo first (POST /v1/vendor/media/uploads, purpose vendor.logo) and confirm it. A field left out stays as it is; null clears it.',
  })
  @ApiOkResponse({ type: VendorProfileResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.MEDIA_NOT_FOUND,
    ErrorCode.MEDIA_NOT_READY,
    ErrorCode.NOT_FOUND,
    ErrorCode.UNAUTHORIZED,
    ErrorCode.ACCESS_TOKEN_EXPIRED,
    ErrorCode.FORBIDDEN,
    ErrorCode.VENDOR_SUSPENDED,
    ErrorCode.RATE_LIMITED,
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
