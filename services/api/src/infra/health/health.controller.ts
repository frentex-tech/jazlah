import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ApiErrorResponses } from '@common/decorators/api-error-responses.decorator';
import { SkipRateLimit } from '@infra/rate-limit/skip-rate-limit.decorator';
import { LivenessResponseDto } from './dto/liveness-response.dto';
import { ReadinessResponseDto } from './dto/readiness-response.dto';
import { ReadinessService } from './readiness.service';

/** Liveness and readiness. Never rate limited: load balancers probe it constantly. */
@ApiTags('health')
@SkipRateLimit()
@Controller('health')
export class HealthController {
  constructor(private readonly readiness: ReadinessService) {}

  /** Liveness: the process answers. Touches no dependency. */
  @Get()
  @ApiOkResponse({
    type: LivenessResponseDto,
    description: 'The process answers.',
  })
  @ApiErrorResponses()
  check(): LivenessResponseDto {
    return { status: 'ok' };
  }

  /** Readiness: every dependency answers. 200 when all are up, 503 naming the one that is down. */
  @Get('ready')
  @ApiOkResponse({
    type: ReadinessResponseDto,
    description: 'Every dependency answered.',
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    type: ReadinessResponseDto,
    description:
      'A dependency did not answer: status is unavailable and checks names it.',
    example: {
      status: 'unavailable',
      checks: { database: 'up', redis: 'down' },
    },
  })
  @ApiErrorResponses()
  async ready(
    @Res({ passthrough: true }) response: Response,
  ): Promise<ReadinessResponseDto> {
    const report = await this.readiness.check();
    response.status(
      report.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
    );
    return report;
  }
}
