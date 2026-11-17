import { ApiProperty } from '@nestjs/swagger';
import { VendorCommissionChangeResponseDto } from './vendor-commission-change-response.dto';

/** One page of a vendor's commission history, newest first. */
export class VendorCommissionChangePageResponseDto {
  @ApiProperty({
    type: [VendorCommissionChangeResponseDto],
    description: 'The commission changes of this page, newest first.',
  })
  items!: VendorCommissionChangeResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Send as `cursor` to get the next page; null on the last page. Opaque: never build or change it.',
    example: 'WyIyMDI2LTExLTE1VDEwOjAwOjAwLjAwMFoiLCI3ZjNhIl0',
  })
  nextCursor!: string | null;
}
