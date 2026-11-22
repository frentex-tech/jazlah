import { z } from 'zod';
import { REVIEW_QUEUE_KINDS } from '../domain/review-queue-kinds.constants';

/** One row of the review queue query (raw SQL), validated before it is mapped. */
export const REVIEW_QUEUE_ROW_SCHEMA = z.object({
  kind: z.enum(REVIEW_QUEUE_KINDS),
  id: z.string(),
  productId: z.string(),
  changeRequestId: z.string().nullable(),
  vendorId: z.string(),
  nameAr: z.string(),
  nameEn: z.string(),
  submittedAt: z.date(),
});
