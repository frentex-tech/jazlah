import { ApiProperty } from '@nestjs/swagger';
import { PublicVendorResponseDto } from './public-vendor-response.dto';

/** One page of active vendors, newest first. */
export class PublicVendorPageResponseDto {
  @ApiProperty({
    type: [PublicVendorResponseDto],
    description: 'The active vendors of this page, newest first.',
  })
  items!: PublicVendorResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Send as `cursor` to get the next page; null on the last page. Opaque: never build or change it.',
    example: 'WyIyMDI2LTExLTE1VDEwOjAwOjAwLjAwMFoiLCI3ZjNhIl0',
  })
  nextCursor!: string | null;
}
