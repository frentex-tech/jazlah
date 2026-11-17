import { ApiProperty } from '@nestjs/swagger';
import type { VendorStatus } from '../../domain/vendor-status.type';
import { VENDOR_STATUSES } from '../../domain/vendor-statuses.constants';
import { VendorProfileResponseDto } from './vendor-profile-response.dto';

/** A vendor as an admin sees it: its profile, plus its status and where it came from. */
export class AdminVendorResponseDto extends VendorProfileResponseDto {
  @ApiProperty({
    description:
      'Whether this is the platform’s own vendor (JAZLA’s products). It has no owner, application or business and bank details; admins manage its profile and products.',
    example: false,
  })
  isPlatform!: boolean;

  @ApiProperty({
    enum: VENDOR_STATUSES,
    description:
      'active: trades and is listed publicly. suspended: hidden from customers, and its users are refused on vendor routes, at sign-in and on refresh (VENDOR_SUSPENDED) until an admin reinstates it.',
    example: 'active',
  })
  status!: VendorStatus;

  @ApiProperty({
    type: Date,
    nullable: true,
    description:
      'When it was suspended, UTC ISO 8601; null while active. Example of a suspended vendor: 2026-11-15T10:00:00.000Z.',
    example: null,
  })
  suspendedAt!: Date | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The admin’s reason for the suspension, 1 to 500 characters, shown to admins only; null while active.',
    example: null,
  })
  suspensionReason!: string | null;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'The id (UUID) of the approved application the vendor came from; null only for the platform vendor.',
    example: '5b1d9e2a-3c4f-4a6b-8d7e-9f0a1b2c3d4e',
  })
  applicationId!: string | null;
}
