import { ApiProperty } from '@nestjs/swagger';
import { VendorCommissionChangeResponseDto } from './vendor-commission-change-response.dto';

/** One page of a vendor's commission history, newest first. */
export class VendorCommissionChangePageResponseDto {
  @ApiProperty({ type: [VendorCommissionChangeResponseDto] })
  items!: VendorCommissionChangeResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Send as `cursor` for the next page; null on the last page.',
    example: null,
  })
  nextCursor!: string | null;
}
