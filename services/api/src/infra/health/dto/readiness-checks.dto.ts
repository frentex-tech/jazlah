import { ApiProperty } from '@nestjs/swagger';
import type { DependencyStatus } from '../dependency-status.type';
import { DEPENDENCY_STATUSES } from '../dependency-statuses.constants';
import type { ReadinessReport } from '../readiness-report.type';

/** Whether each dependency answered its readiness check. */
export class ReadinessChecksDto implements Readonly<ReadinessReport['checks']> {
  @ApiProperty({ enum: DEPENDENCY_STATUSES, example: 'up' })
  readonly database!: DependencyStatus;

  @ApiProperty({ enum: DEPENDENCY_STATUSES, example: 'up' })
  readonly redis!: DependencyStatus;
}
