import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { AccountDeletionReason } from '../../domain/account-deletion-reason.type';
import { ACCOUNT_DELETION_REASONS } from '../../domain/account-deletion-reasons.constants';

/** The optional query of an account deletion: why, from a fixed list (never free text). */
export class DeleteAccountQueryDto {
  @ApiPropertyOptional({
    enum: ACCOUNT_DELETION_REASONS,
    description:
      'Why the customer leaves; kept in the audit log, with nothing that identifies them.',
    example: 'not_using',
  })
  @IsOptional()
  @IsIn(ACCOUNT_DELETION_REASONS)
  reason?: AccountDeletionReason;
}
