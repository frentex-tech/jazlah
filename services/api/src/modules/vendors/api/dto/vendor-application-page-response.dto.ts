import { ApiProperty } from '@nestjs/swagger';
import { VendorApplicationResponseDto } from './vendor-application-response.dto';

/** One page of applications, newest first. */
export class VendorApplicationPageResponseDto {
  @ApiProperty({
    type: [VendorApplicationResponseDto],
    description: 'The applications of this page, newest first.',
  })
  items!: VendorApplicationResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Send as `cursor` to get the next page; null on the last page. Opaque: never build or change it.',
    example: 'WyIyMDI2LTExLTE1VDEwOjAwOjAwLjAwMFoiLCI3ZjNhIl0',
  })
  nextCursor!: string | null;
}
