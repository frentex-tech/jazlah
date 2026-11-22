import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsString, Length, Max, Min } from 'class-validator';
import { trimText } from '@common/dto/trim-text';
import { WALLET_ADJUSTMENT_TYPES } from '../../domain/wallet-adjustment-types.constants';

/** An admin credit or debit of a customer’s wallet, with the reason (audited). */
export class AdjustWalletDto {
  @ApiProperty({
    enum: WALLET_ADJUSTMENT_TYPES,
    example: 'credit',
    description:
      '`credit` adds, `debit` takes (WALLET_INSUFFICIENT beyond the balance).',
  })
  @IsIn(WALLET_ADJUSTMENT_TYPES)
  type!: (typeof WALLET_ADJUSTMENT_TYPES)[number];

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 10_000_000,
    example: 5000,
    description: 'How much, in halalas, 1 to 10000000.',
  })
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  amountHalalas!: number;

  @ApiProperty({
    example: 'تعويض عن تأخير',
    description:
      'Why, kept in the audit log and shown in the history; 3 to 500 characters.',
  })
  @Transform(trimText)
  @IsString()
  @Length(3, 500)
  reason!: string;
}
