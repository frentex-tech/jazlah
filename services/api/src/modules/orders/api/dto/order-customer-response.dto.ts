import { ApiProperty } from '@nestjs/swagger';

/** Who placed the order. */
export class OrderCustomerResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '2b1c0d9e-8f7a-4b6c-9d5e-4f3a2b1c0d9e',
    description: 'The customer (UUID).',
  })
  id!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'عبدالله الحربي',
    description: 'The profile’s full name; null when not set.',
  })
  name!: string | null;

  @ApiProperty({
    example: '+966500000001',
    description:
      'The customer’s mobile: in full for admins, masked for the vendor (`+9665•••••01`).',
  })
  phone!: string;
}
