import { ApiProperty } from '@nestjs/swagger';
import { AdminVendorResponseDto } from './admin-vendor-response.dto';

/** One page of vendors, newest first. */
export class AdminVendorPageResponseDto {
  @ApiProperty({
    type: [AdminVendorResponseDto],
    description: 'The vendors of this page, newest first.',
  })
  items!: AdminVendorResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Send as `cursor` to get the next page; null on the last page. Opaque: never build or change it.',
    example: 'WyIyMDI2LTExLTE1VDEwOjAwOjAwLjAwMFoiLCI3ZjNhIl0',
  })
  nextCursor!: string | null;
}
