// lint-rule: R12 violates
// eslint-disable-next-line boundaries/dependencies -- a boundary rule is never disabled
import { now } from '@infra/clock/clock';

export const started = now();
