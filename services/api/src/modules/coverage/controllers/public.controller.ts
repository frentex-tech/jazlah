import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { ErrorCode } from '@common/errors/error-code.enum';
import { API_TAGS } from '@infra/api-docs/api-tags.constants';
import { CoverageService } from '../coverage.service';
import { CoverageCheckQueryDto } from '../dto/coverage-check-query.dto';
import { CoverageCheckResponseDto } from '../dto/coverage-check-response.dto';
import { toCoverageCheckResponse } from '../to-coverage-check-response';

/** Whether we deliver to a point, for anyone (FR-LOC-03). */
@ApiTags(API_TAGS.publicCoverage.name)
@Controller('public/coverage')
export class PublicCoverageController {
  constructor(private readonly coverage: CoverageService) {}

  @Get('check')
  @ApiOperation({
    operationId: 'publicCheckCoverage',
    summary: 'Do we deliver to this point?',
    description: [
      'Customer app, the map pin (before or after sign-in): whether an active coverage zone covers the point, and which. Public: no token needed.',
      'Inactive zones never count. Saved addresses also carry `isCovered` (GET /v1/customer/addresses).',
      'VALIDATION_FAILED for a missing or out-of-range lat or lng.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    type: CoverageCheckResponseDto,
    description: 'Whether the point is covered, and the zone when it is.',
  })
  @ApiErrorResponses(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.RATE_LIMITED,
    ErrorCode.SERVICE_UNAVAILABLE,
  )
  async check(
    @Query() query: CoverageCheckQueryDto,
  ): Promise<CoverageCheckResponseDto> {
    return toCoverageCheckResponse(
      await this.coverage.findZone({
        latitude: Number(query.lat),
        longitude: Number(query.lng),
      }),
    );
  }
}
