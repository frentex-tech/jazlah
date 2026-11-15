import type { DependencyStatus } from './dependency-status.type';

/**
 * The body of `GET /v1/health/ready`: `ok` (HTTP 200) when every dependency is up,
 * `unavailable` (HTTP 503) when one is down or the instance is shutting down
 * (`draining: true`, present only then). Names and statuses only: never a connection
 * string or a driver's error text.
 */
export type ReadinessReport = Readonly<{
  status: 'ok' | 'unavailable';
  checks: Readonly<{ database: DependencyStatus; redis: DependencyStatus }>;
  draining?: true;
}>;
