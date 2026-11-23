import type { Env } from '@config/env.type';

/**
 * Why the development seed must not run, or null when it may, so fake vendors,
 * products and sign-in accounts never reach real customers. Checked before anything is
 * touched, whatever the database:
 * - DEPLOYMENT_ENV=production: always refused, flag or not.
 * - DEPLOYMENT_ENV=staging: refused unless the run was confirmed with `--allow-staging`
 *   (`pnpm db:seed --allow-staging`).
 * - development: allowed.
 */
export function productionRefusal(
  deploymentEnv: Env['DEPLOYMENT_ENV'],
  allowStaging: boolean,
): string | null {
  if (deploymentEnv === 'production') {
    return 'pnpm db:seed refused: DEPLOYMENT_ENV is production. The seed fills a database with fake vendors, products and sign-in accounts; it never runs in production.';
  }
  if (deploymentEnv === 'staging' && !allowStaging) {
    return 'pnpm db:seed refused: DEPLOYMENT_ENV is staging. The seed fills the database with fake vendors, products and sign-in accounts; to do that on staging on purpose, run: pnpm db:seed --allow-staging';
  }
  return null;
}
