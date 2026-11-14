import type { z } from 'zod';
import type { envSchema } from './env.schema';

/** The validated environment, with defaults applied and values converted. */
export type Env = z.infer<typeof envSchema>;
