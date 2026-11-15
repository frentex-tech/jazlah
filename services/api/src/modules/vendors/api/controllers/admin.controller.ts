import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { AdminVendorPageResponseDto } from '../dto/admin-vendor-page-response.dto';
import { AdminVendorResponseDto } from '../dto/admin-vendor-response.dto';
import { CommissionDto } from '../dto/commission.dto';
import { ListVendorApplicationsQueryDto } from '../dto/list-vendor-applications-query.dto';
import { ListVendorsQueryDto } from '../dto/list-vendors-query.dto';
import { ReasonDto } from '../dto/reason.dto';
import { VendorApplicationDetailResponseDto } from '../dto/vendor-application-detail-response.dto';
import { VendorApplicationPageResponseDto } from '../dto/vendor-application-page-response.dto';
import { VendorApplicationResponseDto } from '../dto/vendor-application-response.dto';
import { VendorCommissionChangePageResponseDto } from '../dto/vendor-commission-change-page-response.dto';
import { ADMIN_AUTH_ERRORS } from '../admin-auth-errors.constants';
import { toAdminVendorResponse } from '../to-admin-vendor-response';
import { toVendorApplicationDetailResponse } from '../to-vendor-application-detail-response';
import { toVendorApplicationResponse } from '../to-vendor-application-response';
import { toVendorCommissionChangeResponse } from '../to-vendor-commission-change-response';

/**
 * Vendor management for admins (FR-ADM-04): reviewing applications and their
 * documents, approving with a commission or rejecting, suspending and reinstating
 * vendors, and their commission with its history. Every change is audited.
 */
@ApiTags('vendors')
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
  ) {}

  @Get('vendor-applications')
  @ApiOperation({ summary: 'Vendor applications, newest first' })
  @ApiOkResponse({ type: VendorApplicationPageResponseDto })
  @ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ...ADMIN_AUTH_ERRORS)
  async applications(
    @Query() query: ListVendorApplicationsQueryDto,
  ): Promise<VendorApplicationPageResponseDto> {
    const page = await this.listApplications.execute(
      query.status === undefined ? {} : { status: query.status },
      toPageRequest(query),
    );
    return {
      items: page.items.map(toVendorApplicationResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Get('vendor-applications/:id')
  @ApiOperation({
    summary: 'One vendor application, with a link to each document',
  })
  @ApiOkResponse({ type: VendorApplicationDetailResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
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
  @ApiOperation({
    summary: 'Approve a pending application with a commission',
    description:
      'Creates the vendor and gives the applicant vendor access. VENDOR_ACCESS_ALREADY_HELD when the applicant came to work for another vendor after applying; the application stays pending.',
  })
  @ApiOkResponse({ type: AdminVendorResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.VENDOR_APPLICATION_NOT_PENDING,
    ErrorCode.VENDOR_ACCESS_ALREADY_HELD,
    ErrorCode.CONFLICT,
    ErrorCode.TRANSACTION_CONFLICT,
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
    // A new vendor has no logo yet.
    return toAdminVendorResponse({ vendor, logoUrl: null });
  }

  @Post('vendor-applications/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a pending application with a reason',
    description: 'The applicant sees the reason and may apply again.',
  })
  @ApiOkResponse({ type: VendorApplicationResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.VENDOR_APPLICATION_NOT_PENDING,
    ErrorCode.TRANSACTION_CONFLICT,
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
  @ApiOperation({ summary: 'Vendors, newest first' })
  @ApiOkResponse({ type: AdminVendorPageResponseDto })
  @ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ...ADMIN_AUTH_ERRORS)
  async vendors(
    @Query() query: ListVendorsQueryDto,
  ): Promise<AdminVendorPageResponseDto> {
    const page = await this.listVendors.execute(
      query.status === undefined ? {} : { status: query.status },
      toPageRequest(query),
    );
    return {
      items: page.items.map(toAdminVendorResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Get('vendors/:id')
  @ApiOperation({ summary: 'One vendor' })
  @ApiOkResponse({ type: AdminVendorResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ...ADMIN_AUTH_ERRORS,
  )
  async vendor(@Param() params: IdParamDto): Promise<AdminVendorResponseDto> {
    return toAdminVendorResponse(await this.getVendor.execute(params.id));
  }

  @Post('vendors/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Suspend an active vendor',
    description:
      'From now on its users are refused on vendor routes, at sign-in and on refresh (VENDOR_SUSPENDED), and it leaves the public list. CONFLICT when it is suspended already.',
  })
  @ApiOkResponse({ type: AdminVendorResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.CONFLICT,
    ErrorCode.TRANSACTION_CONFLICT,
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
  @ApiOperation({
    summary: 'Reinstate a suspended vendor',
    description: 'CONFLICT when it is active already.',
  })
  @ApiOkResponse({ type: AdminVendorResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.CONFLICT,
    ErrorCode.TRANSACTION_CONFLICT,
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

  @Put('vendors/:id/commission')
  @ApiOperation({
    summary: 'Set a vendor’s commission for future orders',
    description:
      'Orders already placed keep theirs. Recorded in the commission history. CONFLICT when another change was made at the same moment.',
  })
  @ApiOkResponse({ type: AdminVendorResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.CONFLICT,
    ErrorCode.TRANSACTION_CONFLICT,
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
  @ApiOperation({ summary: 'A vendor’s commission history, newest first' })
  @ApiOkResponse({ type: VendorCommissionChangePageResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
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
