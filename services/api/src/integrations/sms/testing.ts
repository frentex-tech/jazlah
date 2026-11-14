// The test-only entry of the sms integration: its fake and test helpers. Imported only
// from tests (`*.spec.ts`, `test/`), lint rule R22; production code uses index.ts.
export { FakeSmsProvider } from './providers/fake.provider';
