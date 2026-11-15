import { ApiProperty } from '@nestjs/swagger';
import { AdminVendorResponseDto } from './admin-vendor-response.dto';

/** One page of vendors, newest first. */
export class AdminVendorPageResponseDto {
  @ApiProperty({ type: [AdminVendorResponseDto] })
  items!: AdminVendorResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Send as `cursor` for the next page; null on the last page.',
    example: null,
  })
  nextCursor!: string | null;
}
