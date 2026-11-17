import { ApiProperty } from '@nestjs/swagger';
import { VendorIncompatibilityResponseDto } from './vendor-incompatibility-response.dto';

/** Every cutting and packaging pair a product may not offer together (not paged). */
export class VendorIncompatibilityListResponseDto {
  @ApiProperty({
    type: [VendorIncompatibilityResponseDto],
    description:
      'Every pair whose cutting style is active, oldest rule first; empty when there is none.',
  })
  items!: VendorIncompatibilityResponseDto[];
}
