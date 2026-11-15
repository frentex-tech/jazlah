import { ApiProperty } from '@nestjs/swagger';
import type { VendorStatus } from '../../domain/vendor-status.type';
import { VENDOR_STATUSES } from '../../domain/vendor-statuses.constants';
import { VendorProfileResponseDto } from './vendor-profile-response.dto';

/** A vendor as an admin sees it: its profile, plus its status and where it came from. */
export class AdminVendorResponseDto extends VendorProfileResponseDto {
  @ApiProperty({
    description:
      'Whether this is the platform’s own vendor (JAZLA’s products).',
    example: false,
  })
  isPlatform!: boolean;

  @ApiProperty({ enum: VENDOR_STATUSES, example: 'active' })
  status!: VendorStatus;

  @ApiProperty({ type: Date, nullable: true, example: null })
  suspendedAt!: Date | null;

  @ApiProperty({ type: String, nullable: true, example: null })
  suspensionReason!: string | null;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'The approved application; null only for the platform vendor.',
    example: '5b1d9e2a-3c4f-4a6b-8d7e-9f0a1b2c3d4e',
  })
  applicationId!: string | null;
}
