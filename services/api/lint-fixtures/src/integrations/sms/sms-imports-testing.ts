// lint-rule: R22 violates
// The integration's own production code may not use its fake either.
import { FakeSmsProvider } from './testing';

export const provider = new FakeSmsProvider();
