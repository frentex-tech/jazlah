import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { IdParamDto } from '@common/dto/id-param.dto';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
import { GetPublicVendorUseCase } from '../../application/get-public-vendor.use-case';
import { ListPublicVendorsUseCase } from '../../application/list-public-vendors.use-case';
import { PublicVendorPageResponseDto } from '../dto/public-vendor-page-response.dto';
import { PublicVendorResponseDto } from '../dto/public-vendor-response.dto';
import { toPublicVendorResponse } from '../to-public-vendor-response';

/** The active vendors, for anyone (FR-CAT-02). A suspended vendor never appears. */
@ApiTags('vendors')
@Controller('public/vendors')
export class PublicVendorsController {
  constructor(
    private readonly listVendors: ListPublicVendorsUseCase,
    private readonly getVendor: GetPublicVendorUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'The active vendors, newest first' })
  @ApiOkResponse({ type: PublicVendorPageResponseDto })
  @ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ErrorCode.RATE_LIMITED)
  async list(
    @Query() query: PageQueryDto,
  ): Promise<PublicVendorPageResponseDto> {
    const page = await this.listVendors.execute(toPageRequest(query));
    return {
      items: page.items.map(toPublicVendorResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'One active vendor',
    description: 'NOT_FOUND for an unknown or suspended vendor.',
  })
  @ApiOkResponse({ type: PublicVendorResponseDto })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.RATE_LIMITED,
  )
  async read(@Param() params: IdParamDto): Promise<PublicVendorResponseDto> {
    return toPublicVendorResponse(await this.getVendor.execute(params.id));
  }
}
