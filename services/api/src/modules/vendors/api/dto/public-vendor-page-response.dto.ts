import { ApiProperty } from '@nestjs/swagger';
import { PublicVendorResponseDto } from './public-vendor-response.dto';

/** One page of active vendors, newest first. */
export class PublicVendorPageResponseDto {
  @ApiProperty({ type: [PublicVendorResponseDto] })
  items!: PublicVendorResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Send as `cursor` for the next page; null on the last page.',
    example: null,
  })
  nextCursor!: string | null;
}
