import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { IdParamDto } from '@common/dto/id-param.dto';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
import { GetPublicVendorUseCase } from '../../application/get-public-vendor.use-case';
import { ListPublicVendorsUseCase } from '../../application/list-public-vendors.use-case';
import { PublicVendorPageResponseDto } from '../dto/public-vendor-page-response.dto';
import { PublicVendorResponseDto } from '../dto/public-vendor-response.dto';
import { toPublicVendorResponse } from '../to-public-vendor-response';

/** The active vendors, for anyone (FR-CAT-02). A suspended vendor never appears. */
@ApiTags(API_TAGS.publicVendors.name)
@Controller('public/vendors')
export class PublicVendorsController {
  constructor(
    private readonly listVendors: ListPublicVendorsUseCase,
    private readonly getVendor: GetPublicVendorUseCase,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'publicListVendors',
    summary: 'The active vendors, newest first',
    description: [
      'Customer app and customer web, stores list: the vendors customers can buy from, with name, description and logo. Public: no token needed. A suspended vendor never appears.',
      'Paged by cursor, newest first, no total count: send the previous page’s nextCursor as cursor; limit 1 to 50, default 20. VALIDATION_FAILED for a cursor the API did not write or a limit out of range.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: PublicVendorPageResponseDto,
    description: 'One page of active vendors.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.RATE_LIMITED,
    ErrorCode.SERVICE_UNAVAILABLE,
  )
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
    operationId: 'publicGetVendor',
    summary: 'One active vendor',
    description: [
      'Customer app and customer web, store page: one vendor’s name, description and logo. Public: no token needed. Its products: GET /v1/public/products with vendorId.',
      'NOT_FOUND for an unknown id and for a suspended vendor alike: show the store as unavailable.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: PublicVendorResponseDto,
    description: 'The vendor as customers see it.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.RATE_LIMITED,
    ErrorCode.SERVICE_UNAVAILABLE,
  )
  async read(@Param() params: IdParamDto): Promise<PublicVendorResponseDto> {
    return toPublicVendorResponse(await this.getVendor.execute(params.id));
  }
}
