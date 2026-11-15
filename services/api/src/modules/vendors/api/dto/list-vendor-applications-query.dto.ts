import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { VENDOR_APPLICATION_STATUSES } from '../../domain/vendor-application-statuses.constants';
import type { VendorApplicationStatus } from '../../domain/vendor-application-status.type';

/** The query of the admin's list of applications: a page, optionally of one status. */
export class ListVendorApplicationsQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    enum: VENDOR_APPLICATION_STATUSES,
    example: 'pending',
  })
  @IsOptional()
  @IsIn(VENDOR_APPLICATION_STATUSES)
  status?: VendorApplicationStatus;
}
