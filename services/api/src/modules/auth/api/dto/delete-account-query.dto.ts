import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { AccountDeletionReason } from '../../domain/account-deletion-reason.type';
import { ACCOUNT_DELETION_REASONS } from '../../domain/account-deletion-reasons.constants';

/** The optional query of an account deletion: why, from a fixed list (never free text). */
export class DeleteAccountQueryDto {
  @ApiPropertyOptional({
    enum: ACCOUNT_DELETION_REASONS,
    description:
      'Optional: why the customer leaves, one value of a fixed list the app shows (`not_using`, `privacy`, `bad_experience`, `other_account`, `other`; never free text). Kept in the audit log, with nothing that identifies the customer.',
    example: 'not_using',
  })
  @IsOptional()
  @IsIn(ACCOUNT_DELETION_REASONS)
  reason?: AccountDeletionReason;
}
