import { Module } from '@nestjs/common';
import { AuditLogWriter } from './audit-log-writer';

/** The audit log writer (AuditLogWriter); a module that audits its actions imports this. */
@Module({
  providers: [AuditLogWriter],
  exports: [AuditLogWriter],
})
export class AuditModule {}
