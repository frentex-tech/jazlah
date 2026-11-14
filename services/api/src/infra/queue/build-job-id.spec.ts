import { buildJobId } from './build-job-id';
import { InvalidJobIdError } from './invalid-job-id.error';

describe('buildJobId', () => {
  it('joins the operation and the parts', () => {
    expect(buildJobId('payment-webhook', 'geidea', 'evt_0f3a-91', 42)).toBe(
      'payment-webhook.geidea.evt_0f3a-91.42',
    );
  });

  it('gives the same id for the same input', () => {
    expect(buildJobId('invoice-submit', 'inv-1')).toBe(
      buildJobId('invoice-submit', 'inv-1'),
    );
  });

  it('gives different ids for different inputs that would join the same way', () => {
    expect(buildJobId('op', 'a.b', 'c')).not.toBe(buildJobId('op', 'a', 'b.c'));
  });

  it('never contains a colon, which Redis keys use as a separator', () => {
    const id = buildJobId('payment-webhook', 'urn:geidea:evt:1');
    expect(id).not.toContain(':');
    expect(id).toBe('payment-webhook.urn%3Ageidea%3Aevt%3A1');
  });

  it('is never all digits, which BullMQ rejects', () => {
    expect(buildJobId('op', 123)).toMatch(/\D/);
  });

  it.each([
    ['empty', ''],
    ['starting with a digit', '1-op'],
    ['not kebab-case', 'PaymentWebhook'],
    ['with the separator', 'payment.webhook'],
  ])('rejects an operation that is %s', (_label, operation) => {
    expect(() => buildJobId(operation, 'x')).toThrow(InvalidJobIdError);
  });

  it('rejects a call without parts', () => {
    expect(() => buildJobId('op')).toThrow(InvalidJobIdError);
  });

  it('rejects an empty part', () => {
    expect(() => buildJobId('op', 'a', '')).toThrow(InvalidJobIdError);
  });
});
