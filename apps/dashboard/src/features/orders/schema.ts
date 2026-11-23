import { z } from 'zod';
import { METHODS, STATUSES } from './types';

// The bodies and queries our order routes accept, checked before the call (the API checks them again).
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const OrderQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  paymentMethod: z.enum(METHODS).optional(),
  vendorId: z.string().uuid().optional(),
  fulfilmentDate: day.optional(),
  q: z.string().trim().min(1).max(100).optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
export const TransitionSchema = z.object({ to: z.enum(STATUSES), note: z.string().trim().max(500).optional() });
export const CancelSchema = z.object({ reason: z.string().trim().min(1).max(500), refundTo: z.enum(['wallet', 'original']) });
export const RescheduleSchema = z.object({ date: day });
