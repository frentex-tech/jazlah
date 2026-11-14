// lint-rule: R8 violates
// The review's bypass: domain code reaching a Nest decorator through src/common.
import { Audited } from '@common/decorators/audited.decorator';

export class OrderAudit {
  @Audited()
  record(): void {}
}
