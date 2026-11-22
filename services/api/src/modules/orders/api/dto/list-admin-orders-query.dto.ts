import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { ListVendorOrdersQueryDto } from './list-vendor-orders-query.dto';

/** Every order, filtered. */
export class ListAdminOrdersQueryDto extends ListVendorOrdersQueryDto {
  @ApiPropertyOptional({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'Only this vendor’s orders (UUID).',
  })
  @IsOptional()
  @IsUUID()
  vendorId?: string;
}
