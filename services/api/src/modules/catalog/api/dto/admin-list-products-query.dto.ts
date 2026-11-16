import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { ListProductsQueryDto } from './list-products-query.dto';

/**
 * The admins' product list: a page, optionally of one status (`pending_review`: the
 * review queue) and one vendor.
 */
export class AdminListProductsQueryDto extends ListProductsQueryDto {
  @ApiPropertyOptional({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  @IsOptional()
  @IsUUID()
  vendorId?: string;
}
