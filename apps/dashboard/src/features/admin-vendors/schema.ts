import { z } from 'zod';

// The API's rules (list queries, CommissionDto, ReasonDto), checked at our route before the call; the API checks them again.
const q = z.string().trim().min(2).max(100).optional();
const cursor = z.string().min(1).optional();
export const ApplicationQuerySchema = z.object({ status: z.enum(['pending', 'approved', 'rejected']).optional(), q, cursor });
export const VendorQuerySchema = z.object({ status: z.enum(['active', 'suspended']).optional(), q, city: z.string().trim().min(2).max(50).optional(), cursor });
export const CommissionSchema = z.object({ commissionBasisPoints: z.number().int().min(0).max(10000) });
export const ReasonSchema = z.object({ reason: z.string().trim().min(1).max(500) });

/** The query string as an object, empty values left out. */
export const queryOf = (url: URL) => Object.fromEntries([...url.searchParams].filter(([, v]) => v !== ''));
