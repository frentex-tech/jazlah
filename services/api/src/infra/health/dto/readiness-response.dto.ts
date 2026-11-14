import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ReadinessReport } from '../readiness-report.type';
import { ReadinessChecksDto } from './readiness-checks.dto';

/** The body of `GET /v1/health/ready`, with 200 (`ok`) and with 503 (`unavailable`). */
export class ReadinessResponseDto implements ReadinessReport {
  @ApiProperty({
    description:
      'ok (HTTP 200) when every dependency is up; unavailable (HTTP 503) when one is down or the instance is shutting down.',
    enum: ['ok', 'unavailable'],
    example: 'ok',
  })
  readonly status!: 'ok' | 'unavailable';

  @ApiProperty({ type: ReadinessChecksDto })
  readonly checks!: ReadinessChecksDto;

  @ApiPropertyOptional({
    description:
      'Present, true, while the instance shuts down: status is then unavailable (HTTP 503) whatever the checks say.',
    enum: [true],
    example: true,
  })
  readonly draining?: true;
}
