import { ApiProperty } from '@nestjs/swagger';
import { CuttingPackagingIncompatibilityResponseDto } from './cutting-packaging-incompatibility-response.dto';

/** One page of cutting and packaging rules, newest first. */
export class CuttingPackagingIncompatibilityPageResponseDto {
  @ApiProperty({ type: [CuttingPackagingIncompatibilityResponseDto] })
  items!: CuttingPackagingIncompatibilityResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Send as `cursor` for the next page; null on the last page.',
    example: null,
  })
  nextCursor!: string | null;
}
