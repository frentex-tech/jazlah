// lint-rule: R17 violates
import { QueueEvents } from 'bullmq';

export function listenToCatalogSync(): QueueEvents {
  return new QueueEvents('catalog-sync');
}
