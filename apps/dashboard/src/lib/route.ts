import type { NextRequest } from 'next/server';
import type { z } from 'zod';

/** Language for the API's messages: the page sends its own locale (lib/panel-fetch.ts). */
export const langOf = (req: NextRequest) => (req.headers.get('accept-language') === 'en' ? 'en' : 'ar');

/** A body our route refused before the call, answered like the API's VALIDATION_FAILED (field paths, constraints; a
 * custom rule's name is its message). */
export const invalidBody = (error: z.ZodError) => ({
  ok: false as const,
  code: 'VALIDATION_FAILED',
  status: 400,
  details: error.issues.map((i) => ({ field: i.path.join('.'), constraints: [i.code === 'custom' ? i.message : i.code] })),
});
