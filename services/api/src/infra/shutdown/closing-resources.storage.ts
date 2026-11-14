import { ClosingResources } from './closing-resources';

/**
 * The process's one list of closing resources. A module-level instance rather than a
 * provider because the resources that report to it (BullMQ workers and queues, the
 * Prisma and Redis clients) are built by libraries and by Nest, not given it by
 * injection; `closeWithDeadline` reads it.
 */
export const closingResources = new ClosingResources();
