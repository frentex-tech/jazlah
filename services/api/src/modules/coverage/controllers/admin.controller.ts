import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { ADMIN_AUTH_ERRORS } from '@common/decorators/admin-auth-errors.constants';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IdParamDto } from '@common/dto/id-param.dto';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { ErrorCode } from '@common/errors/error-code.enum';
import { toNextCursor } from '@common/pagination/to-next-cursor';
import { toPageRequest } from '@common/pagination/to-page-request';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { COVERAGE_ZONE_COLOR } from '../coverage-zone-color.constants';
import { CoverageZonesService } from '../coverage-zones.service';
import { CoverageZonePageResponseDto } from '../dto/coverage-zone-page-response.dto';
import { CoverageZoneResponseDto } from '../dto/coverage-zone-response.dto';
import { CreateCoverageZoneDto } from '../dto/create-coverage-zone.dto';
import { UpdateCoverageZoneDto } from '../dto/update-coverage-zone.dto';
import { toCoverageZoneResponse } from '../to-coverage-zone-response';
import { toPolygon } from '../to-polygon';

/**
 * The coverage zones for admins (FR-LOC-02): the delivery areas, drawn as GeoJSON
 * polygons. Every change is audited and applies to the coverage check at once.
 */
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@ApiTags(API_TAGS.adminCoverageZones.name)
@Controller('admin/coverage-zones')
export class AdminCoverageController {
  constructor(private readonly zones: CoverageZonesService) {}

  @Get()
  @ApiOperation({
    operationId: 'adminListCoverageZones',
    summary: 'The coverage zones, newest first',
    description:
      'Admin dashboard, the coverage zones map and list. Every zone, active and inactive, with its polygon, newest first. Keyset paging: send `nextCursor` back as `cursor` until it is null; no total count.',
  })
  @ApiOkResponse({
    type: CoverageZonePageResponseDto,
    description: 'One page of zones.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async list(
    @Query() query: PageQueryDto,
  ): Promise<CoverageZonePageResponseDto> {
    const page = await this.zones.list(toPageRequest(query));
    return {
      items: page.items.map(toCoverageZoneResponse),
      nextCursor: toNextCursor(page),
    };
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'adminGetCoverageZone',
    summary: 'One coverage zone',
    description:
      'Admin dashboard, the zone editor. NOT_FOUND for an unknown id.',
  })
  @ApiOkResponse({ type: CoverageZoneResponseDto, description: 'The zone.' })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async read(@Param() params: IdParamDto): Promise<CoverageZoneResponseDto> {
    return toCoverageZoneResponse(await this.zones.get(params.id));
  }

  @Post()
  @ApiOperation({
    operationId: 'adminCreateCoverageZone',
    summary: 'Add a coverage zone',
    description:
      `Admin dashboard, the zone editor: the admin draws the boundary on the map. Active at once unless \`isActive\` is false; \`color\` (\`#RRGGBB\`, the map colour) defaults to ${COVERAGE_ZONE_COLOR.default}; the coverage check uses it from the next request. ` +
      'INVALID_POLYGON: the boundary is not a valid polygon (a ring not closed or with fewer than four positions, a position out of range, edges that cross); nothing was saved, let the admin redraw it.',
  })
  @ApiCreatedResponse({
    type: CoverageZoneResponseDto,
    description: 'The new zone.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.INVALID_POLYGON,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateCoverageZoneDto,
  ): Promise<CoverageZoneResponseDto> {
    return toCoverageZoneResponse(
      await this.zones.create(
        {
          name: body.name,
          city: body.city,
          polygon: toPolygon(body.polygon),
          isActive: body.isActive ?? true,
          color: body.color ?? COVERAGE_ZONE_COLOR.default,
        },
        user.userId,
      ),
    );
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'adminUpdateCoverageZone',
    summary: 'Edit a zone, redraw it, or switch it on or off',
    description:
      'Admin dashboard, the zone editor. Changes only the fields sent (name, city, polygon, isActive, color); applies to the coverage check from the next request. ' +
      'NOT_FOUND for an unknown id. INVALID_POLYGON: the new boundary is not a valid polygon; nothing was saved.',
  })
  @ApiOkResponse({
    type: CoverageZoneResponseDto,
    description: 'The zone as saved.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.INVALID_POLYGON,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
    @Body() body: UpdateCoverageZoneDto,
  ): Promise<CoverageZoneResponseDto> {
    return toCoverageZoneResponse(
      await this.zones.update(
        params.id,
        {
          name: body.name,
          city: body.city,
          polygon:
            body.polygon === undefined ? undefined : toPolygon(body.polygon),
          isActive: body.isActive,
          color: body.color,
        },
        user.userId,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'adminDeleteCoverageZone',
    summary: 'Delete a coverage zone',
    description:
      'Admin dashboard, the zone editor. Deletes the zone for good; addresses in it stop being covered from the next request. To pause a zone instead, set `isActive` to false. NOT_FOUND for an unknown id, also when already deleted.',
  })
  @ApiNoContentResponse({ description: 'Deleted. No body.' })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.TRANSACTION_CONFLICT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ...ADMIN_AUTH_ERRORS,
  )
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: IdParamDto,
  ): Promise<void> {
    await this.zones.remove(params.id, user.userId);
  }
}
