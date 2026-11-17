import type { Env } from '@config/env.type';

/**
 * Why the development seed must not run, or null when it may: it refuses
 * `NODE_ENV=production`, whatever the database, so fake vendors, products and
 * sign-in accounts never reach real customers. Checked before anything is touched.
 */
export function productionRefusal(nodeEnv: Env['NODE_ENV']): string | null {
  return nodeEnv === 'production'
    ? 'pnpm db:seed refused: NODE_ENV is production. The seed fills a local development database with fake vendors, products and sign-in accounts; it never runs in production.'
    : null;
}
