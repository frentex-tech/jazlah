import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { VENDOR_APPLICATION_STATUSES } from '../../domain/vendor-application-statuses.constants';
import type { VendorApplicationStatus } from '../../domain/vendor-application-status.type';
import { BusinessSearchQueryDto } from './business-search-query.dto';

/**
 * The query of the admin's list of applications: a page, optionally of one status and
 * matching a search.
 */
export class ListVendorApplicationsQueryDto extends BusinessSearchQueryDto {
  @ApiPropertyOptional({
    enum: VENDOR_APPLICATION_STATUSES,
    description:
      'Only applications in this status: pending (waiting for review), approved or rejected. Omit it for every status.',
    example: 'pending',
  })
  @IsOptional()
  @IsIn(VENDOR_APPLICATION_STATUSES)
  status?: VendorApplicationStatus;
}
