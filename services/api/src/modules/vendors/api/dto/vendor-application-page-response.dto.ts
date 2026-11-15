import { ApiProperty } from '@nestjs/swagger';
import { VendorApplicationResponseDto } from './vendor-application-response.dto';

/** One page of applications, newest first. */
export class VendorApplicationPageResponseDto {
  @ApiProperty({ type: [VendorApplicationResponseDto] })
  items!: VendorApplicationResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Send as `cursor` for the next page; null on the last page.',
    example: null,
  })
  nextCursor!: string | null;
}
