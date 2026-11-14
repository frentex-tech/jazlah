// lint-rule: R17 violates
import * as bullmq from 'bullmq';

export function catalogFlows(): bullmq.FlowProducer {
  return new bullmq.FlowProducer();
}
