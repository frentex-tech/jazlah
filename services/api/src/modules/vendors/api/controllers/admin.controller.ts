import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
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
import { IdParamDto } from '@common/dto/id-param.dto';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
import { ApproveVendorApplicationUseCase } from '../../application/approve-vendor-application.use-case';
import { ChangeVendorCommissionUseCase } from '../../application/change-vendor-commission.use-case';
import { GetVendorApplicationUseCase } from '../../application/get-vendor-application.use-case';
import { GetVendorUseCase } from '../../application/get-vendor.use-case';
import { ListVendorApplicationsUseCase } from '../../application/list-vendor-applications.use-case';
import { ListVendorCommissionChangesUseCase } from '../../application/list-vendor-commission-changes.use-case';
import { ListVendorsUseCase } from '../../application/list-vendors.use-case';
import { ReinstateVendorUseCase } from '../../application/reinstate-vendor.use-case';
import { RejectVendorApplicationUseCase } from '../../application/reject-vendor-application.use-case';
import { SuspendVendorUseCase } from '../../application/suspend-vendor.use-case';
import { UpdateVendorProfileAsAdminUseCase } from '../../application/update-vendor-profile-as-admin.use-case';
import { AdminVendorPageResponseDto } from '../dto/admin-vendor-page-response.dto';
import { AdminVendorResponseDto } from '../dto/admin-vendor-response.dto';
import { CommissionDto } from '../dto/commission.dto';
import { ListVendorApplicationsQueryDto } from '../dto/list-vendor-applications-query.dto';
import { ListVendorsQueryDto } from '../dto/list-vendors-query.dto';
import { ReasonDto } from '@common/dto/reason.dto';
import { UpdateVendorProfileAsAdminDto } from '../dto/update-vendor-profile-as-admin.dto';
import { VendorApplicationDetailResponseDto } from '../dto/vendor-application-detail-response.dto';
import { VendorApplicationPageResponseDto } from '../dto/vendor-application-page-response.dto';
import { VendorApplicationResponseDto } from '../dto/vendor-application-response.dto';
import { VendorCommissionChangePageResponseDto } from '../dto/vendor-commission-change-page-response.dto';
import { ADMIN_AUTH_ERRORS } from '@common/decorators/admin-auth-errors.constants';
import { toAdminVendorResponse } from '../to-admin-vendor-response';
import { toVendorApplicationDetailResponse } from '../to-vendor-application-detail-response';
import { toVendorApplicationResponse } from '../to-vendor-application-response';
import { toVendorCommissionChangeResponse } from '../to-vendor-commission-change-response';
import { toVendorProfileChanges } from '../to-vendor-profile-changes';

/**
 * Vendor management for admins (FR-ADM-04): reviewing applications and their
 * documents, approving with a commission or rejecting, suspending and reinstating
 * vendors, their commission with its history, and any vendor's store profile (logo, cover, descriptions, contact, VAT number, city)
 * (the platform vendor's included). Every change is audited.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('admin')
export class AdminVendorsController {
  constructor(
    private readonly listApplications: ListVendorApplicationsUseCase,
    private readonly getApplication: GetVendorApplicationUseCase,
    private readonly approveApplication: ApproveVendorApplicationUseCase,
    private readonly rejectApplication: RejectVendorApplicationUseCase,
    private readonly listVendors: ListVendorsUseCase,
    private readonly getVendor: GetVendorUseCase,
    private readonly suspendVendor: SuspendVendorUseCase,
    private readonly reinstateVendor: ReinstateVendorUseCase,
    private readonly changeCommission: ChangeVendorCommissionUseCase,
    private readonly listCommissionChanges: ListVendorCommissionChangesUseCase,
    private readonly updateProfile: UpdateVendorProfileAsAdminUseCase,
  ) {}

  @Get('vendor-applications')
  @ApiTags(API_TAGS.adminVendorApplications.name)
  @ApiOperation({
    operationId: 'adminListVendorApplications',
    summary: 'Vendor applications, newest first',
    description: [
      'Admin dashboard, vendor applications list: every application, optionally only one status (status=pending for the review queue) and only those matching a search (q: part of the store name in Arabic or English, any case, or of the commercial registration number; % and _ match themselves). The IBAN is shown masked; open one application for its document links.',
      "Paged by cursor, newest first, no total count: send the previous page's nextCursor as cursor; limit 1 to 50, default 20. VALIDATION_FAILED for an unknown status, a q shorter than 2 or longer than 100 characters, a cursor the API did not write or a limit out of range.",
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: VendorApplicationPageResponseDto,
    description: 'One page of applications.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async applications(
    @Query() query: ListVendorApplicationsQueryDto,
  ): Promise<VendorApplicationPageResponseDto> {
    const page = await this.listApplications.execute(
      {
        ...(query.status === undefined ? {} : { status: query.status }),
        ...(query.q === undefined ? {} : { q: query.q }),
      },
      toPageRequest(query),
    );
    return {
      items: page.items.map(toVendorApplicationResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Get('vendor-applications/:id')
  @ApiTags(API_TAGS.adminVendorApplications.name)
  @ApiOperation({
    operationId: 'adminGetVendorApplication',
    summary: 'One vendor application, with a link to each document',
    description: [
      'Admin dashboard, application review screen: one application with who reviewed it and, for each document, a presigned link to open it. The links expire after a few minutes (expiresAt): read the application again for fresh ones, never store them.',
      'NOT_FOUND for an unknown id, and for an application its applicant removed by deleting their account (only pending and rejected ones are removed). MEDIA_NOT_READY only when that deletion happens while the application is being read: reload, and it is NOT_FOUND.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: VendorApplicationDetailResponseDto,
    description: 'The application with a link to each document.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.MEDIA_NOT_READY,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async application(
    @Param() params: IdParamDto,
  ): Promise<VendorApplicationDetailResponseDto> {
    return toVendorApplicationDetailResponse(
      await this.getApplication.execute(params.id),
    );
  }

  @Post('vendor-applications/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.adminVendorApplications.name)
  @ApiOperation({
    operationId: 'adminApproveVendorApplication',
    summary: 'Approve a pending application with a commission',
    description: [
      "Admin dashboard, application review screen: approves a pending application with the platform commission for the vendor's orders, in basis points (1250 is 12.5%). In one step it creates the vendor (active, listed publicly at once, without a logo), records the first commission in its history, and gives the applicant vendor access: they sign in to the vendor dashboard with the same phone number. Audited.",
      'Errors: VALIDATION_FAILED for a commission that is not a whole number from 0 to 10000. NOT_FOUND for an unknown application. VENDOR_APPLICATION_NOT_PENDING: it was already approved or rejected (also when two admins approve at once: only one vendor is created); reload it. VENDOR_ACCESS_ALREADY_HELD: the applicant came to work for another vendor after applying; nothing changed and the application stays pending. TRANSACTION_CONFLICT: nothing was saved; send again.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: AdminVendorResponseDto,
    description: 'The new vendor.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.VENDOR_APPLICATION_NOT_PENDING,
    ErrorCode.VENDOR_ACCESS_ALREADY_HELD,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async approve(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: CommissionDto,
  ): Promise<AdminVendorResponseDto> {
    const vendor = await this.approveApplication.execute({
      applicationId: params.id,
      reviewerId: user.userId,
      commissionBasisPoints: body.commissionBasisPoints,
    });
    // A new vendor has no logo or cover yet.
    return toAdminVendorResponse({ vendor, logoUrl: null, coverUrl: null });
  }

  @Post('vendor-applications/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.adminVendorApplications.name)
  @ApiOperation({
    operationId: 'adminRejectVendorApplication',
    summary: 'Reject a pending application with a reason',
    description: [
      'Admin dashboard, application review screen: rejects a pending application. The reason (1 to 500 characters) is shown to the applicant in the customer app, so write it for them; they may then apply again. Final: a rejected application never changes. Audited.',
      'Errors: NOT_FOUND for an unknown application. VENDOR_APPLICATION_NOT_PENDING: it was already approved or rejected; reload it. TRANSACTION_CONFLICT: nothing was saved; send again.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: VendorApplicationResponseDto,
    description: 'The application, now rejected.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.VENDOR_APPLICATION_NOT_PENDING,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async reject(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: ReasonDto,
  ): Promise<VendorApplicationResponseDto> {
    return toVendorApplicationResponse(
      await this.rejectApplication.execute({
        applicationId: params.id,
        reviewerId: user.userId,
        reason: body.reason,
      }),
    );
  }

  @Get('vendors')
  @ApiTags(API_TAGS.adminVendors.name)
  @ApiOperation({
    operationId: 'adminListVendors',
    summary: 'Vendors, newest first',
    description: [
      'Admin dashboard, vendors list: every vendor, active and suspended, the platform vendor included (isPlatform), optionally only one status, one city (city, exact) and those matching a search (q: part of the store name in Arabic or English, any case, or of the commercial registration number; % and _ match themselves), with commission, masked IBAN and logo.',
      "Paged by cursor, newest first, no total count: send the previous page's nextCursor as cursor; limit 1 to 50, default 20. VALIDATION_FAILED for an unknown status, a q shorter than 2 or longer than 100 characters, a cursor the API did not write or a limit out of range.",
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: AdminVendorPageResponseDto,
    description: 'One page of vendors.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async vendors(
    @Query() query: ListVendorsQueryDto,
  ): Promise<AdminVendorPageResponseDto> {
    const page = await this.listVendors.execute(
      {
        ...(query.status === undefined ? {} : { status: query.status }),
        ...(query.q === undefined ? {} : { q: query.q }),
        ...(query.city === undefined ? {} : { city: query.city }),
      },
      toPageRequest(query),
    );
    return {
      items: page.items.map(toAdminVendorResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Get('vendors/:id')
  @ApiTags(API_TAGS.adminVendors.name)
  @ApiOperation({
    operationId: 'adminGetVendor',
    summary: 'One vendor',
    description: [
      'Admin dashboard, vendor screen: one vendor in any status, with its commission, masked IBAN, suspension and the application it came from. NOT_FOUND for an unknown id.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: AdminVendorResponseDto,
    description: 'The vendor.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async vendor(@Param() params: IdParamDto): Promise<AdminVendorResponseDto> {
    return toAdminVendorResponse(await this.getVendor.execute(params.id));
  }

  @Post('vendors/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.adminVendors.name)
  @ApiOperation({
    operationId: 'adminSuspendVendor',
    summary: 'Suspend an active vendor',
    description: [
      'Admin dashboard, vendor screen: suspends an active vendor with a reason (1 to 500 characters, shown to admins). From the moment it is saved its users are refused on every vendor route, at sign-in and on refresh (VENDOR_SUSPENDED), and it disappears from the public vendor list and store page. Reinstate it to undo. Audited.',
      'Errors: NOT_FOUND for an unknown vendor. CONFLICT with details.reason VENDOR_ALREADY_SUSPENDED: it is suspended already (also when another admin suspended it at the same moment); reload it. TRANSACTION_CONFLICT: nothing was saved; send again.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: AdminVendorResponseDto,
    description: 'The vendor, now suspended.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.CONFLICT,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async suspend(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: ReasonDto,
  ): Promise<AdminVendorResponseDto> {
    return toAdminVendorResponse(
      await this.suspendVendor.execute({
        vendorId: params.id,
        actorId: user.userId,
        reason: body.reason,
      }),
    );
  }

  @Post('vendors/:id/reinstate')
  @HttpCode(HttpStatus.OK)
  @ApiTags(API_TAGS.adminVendors.name)
  @ApiOperation({
    operationId: 'adminReinstateVendor',
    summary: 'Reinstate a suspended vendor',
    description: [
      'Admin dashboard, vendor screen: makes a suspended vendor active again, with no body. Its users can sign in again and it is listed publicly again; the suspension time and reason are cleared. Audited.',
      'Errors: NOT_FOUND for an unknown vendor. CONFLICT with details.reason VENDOR_NOT_SUSPENDED: it is active already (also when another admin reinstated it at the same moment); reload it. TRANSACTION_CONFLICT: nothing was saved; send again.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: AdminVendorResponseDto,
    description: 'The vendor, now active.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.CONFLICT,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async reinstate(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<AdminVendorResponseDto> {
    return toAdminVendorResponse(
      await this.reinstateVendor.execute({
        vendorId: params.id,
        actorId: user.userId,
      }),
    );
  }

  @Patch('vendors/:id/profile')
  @ApiTags(API_TAGS.adminVendors.name)
  @ApiOperation({
    operationId: 'adminUpdateVendorProfile',
    summary: 'Change a vendor’s store profile',
    description: [
      "Admin dashboard, vendor screen: changes any vendor's logo, cover photo, descriptions, contact phone, contact email, VAT number and city, the platform vendor included (it has no owner, so this is how its profile is set). Only an admin changes the city. Applied at once. Audited with the names of the fields given.",
      'For a new logo or cover photo, upload it first as the signed-in admin (POST /v1/admin/media/uploads, purpose vendor.logo or vendor.cover: JPEG, PNG or WebP up to 2 MB), confirm it (POST /v1/admin/media/{id}/confirm), then send its id. A field left out stays as it is; logoMediaId, coverMediaId, contactPhone, contactEmail or vatNumber null removes it; the city can be changed, not removed; inside description, a language set to null or blank clears it. An empty body changes nothing.',
      'Errors: VALIDATION_FAILED for a malformed field (isSaudiPhoneNumber, isEmail, matches on vatNumber, charLength on city). NOT_FOUND for an unknown vendor. MEDIA_NOT_FOUND (details.mediaId): no file of the right purpose (vendor.logo, vendor.cover) uploaded by this admin with that id (a file another user uploaded counts as missing). MEDIA_NOT_READY: the upload was not confirmed. TRANSACTION_CONFLICT: nothing was saved; send again.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: AdminVendorResponseDto,
    description: 'The vendor after the change.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.MEDIA_NOT_FOUND,
    ErrorCode.MEDIA_NOT_READY,
    ErrorCode.NOT_FOUND,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async updateVendorProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: UpdateVendorProfileAsAdminDto,
  ): Promise<AdminVendorResponseDto> {
    return toAdminVendorResponse(
      await this.updateProfile.execute({
        vendorId: params.id,
        actorId: user.userId,
        changes: toVendorProfileChanges(body),
      }),
    );
  }

  @Put('vendors/:id/commission')
  @ApiTags(API_TAGS.adminVendors.name)
  @ApiOperation({
    operationId: 'adminSetVendorCommission',
    summary: 'Set a vendor’s commission for future orders',
    description: [
      "Admin dashboard, vendor screen: sets the platform commission on the vendor's future orders, in basis points (a whole number from 0 to 10000; 1250 is 12.5%). Orders already placed keep the commission they were placed with. Each change is recorded in the commission history with the previous value, and audited; setting the commission the vendor already has changes and records nothing.",
      'Errors: VALIDATION_FAILED for a fraction or a value out of range. NOT_FOUND for an unknown vendor. CONFLICT: another admin changed the commission at the same moment and nothing was saved; reload and decide again. TRANSACTION_CONFLICT: nothing was saved; send again.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: AdminVendorResponseDto,
    description: 'The vendor with its commission.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.CONFLICT,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async commission(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: CommissionDto,
  ): Promise<AdminVendorResponseDto> {
    return toAdminVendorResponse(
      await this.changeCommission.execute({
        vendorId: params.id,
        actorId: user.userId,
        commissionBasisPoints: body.commissionBasisPoints,
      }),
    );
  }

  @Get('vendors/:id/commission-history')
  @ApiTags(API_TAGS.adminVendors.name)
  @ApiOperation({
    operationId: 'adminListVendorCommissionChanges',
    summary: 'A vendor’s commission history, newest first',
    description: [
      'Admin dashboard, vendor screen: every commission the vendor has had, in basis points, with the previous value and the admin who set it; the oldest entry is the commission set at approval. Entries are never changed or removed.',
      "Paged by cursor, newest first, no total count: send the previous page's nextCursor as cursor; limit 1 to 50, default 20. NOT_FOUND for an unknown vendor.",
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: VendorCommissionChangePageResponseDto,
    description: 'One page of commission changes.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async commissionHistory(
    @Param() params: IdParamDto,
    @Query() query: PageQueryDto,
  ): Promise<VendorCommissionChangePageResponseDto> {
    const page = await this.listCommissionChanges.execute(
      params.id,
      toPageRequest(query),
    );
    return {
      items: page.items.map(toVendorCommissionChangeResponse),
      nextCursor: toNextCursor(page),
    };
  }
}
