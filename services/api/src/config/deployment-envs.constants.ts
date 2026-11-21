/**
 * The values DEPLOYMENT_ENV may take: where this process is deployed, separate from
 * NODE_ENV (how the build and libraries run). Staging runs NODE_ENV=production and
 * DEPLOYMENT_ENV=staging; it differs from production only in allowing the `log` SMS
 * provider (DECISIONS.md, "Deployment environment").
 */
export const DEPLOYMENT_ENVS = [
  'development',
  'staging',
  'production',
] as const;
