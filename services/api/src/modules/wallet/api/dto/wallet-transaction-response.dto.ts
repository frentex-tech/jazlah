import { ApiProperty } from '@nestjs/swagger';
import { WALLET_TRANSACTION_KINDS } from '../../domain/wallet-transaction-kinds.constants';

/** One movement of the wallet balance. */
export class WalletTransactionResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The movement (UUID).',
  })
  id!: string;

  @ApiProperty({
    enum: WALLET_TRANSACTION_KINDS,
    example: 'admin_credit',
    description: 'Why it moved.',
  })
  kind!: (typeof WALLET_TRANSACTION_KINDS)[number];

  @ApiProperty({
    type: 'integer',
    example: 5000,
    description: 'How much, in halalas: positive added, negative taken.',
  })
  amountHalalas!: number;

  @ApiProperty({
    type: 'integer',
    example: 5000,
    description: 'The balance after it, in halalas.',
  })
  balanceAfterHalalas!: number;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    example: null,
    description: 'The order it is about; null for an admin adjustment.',
  })
  orderId!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'تعويض عن تأخير',
    description: 'The admin’s reason for an adjustment; null otherwise.',
  })
  note!: string | null;

  @ApiProperty({
    example: '2026-11-22T09:00:00.000Z',
    description: 'When (UTC).',
  })
  createdAt!: Date;
}
