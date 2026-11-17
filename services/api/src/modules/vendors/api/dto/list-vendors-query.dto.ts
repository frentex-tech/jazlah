import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PageQueryDto } from '@common/dto/page-query.dto';
import { VENDOR_STATUSES } from '../../domain/vendor-statuses.constants';
import type { VendorStatus } from '../../domain/vendor-status.type';

/** The query of the admin's list of vendors: a page, optionally of one status. */
export class ListVendorsQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    enum: VENDOR_STATUSES,
    description:
      'Only vendors in this status: active or suspended. Omit it for every vendor, the platform vendor included.',
    example: 'active',
  })
  @IsOptional()
  @IsIn(VENDOR_STATUSES)
  status?: VendorStatus;
}
