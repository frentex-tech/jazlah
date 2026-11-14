import { SmsError } from '../sms.errors';
import { FakeSmsProvider } from './fake.provider';

const MESSAGE = { to: '+966512345678', text: 'x' };

describe('FakeSmsProvider', () => {
  it('keeps every accepted message and numbers its ids by provider name', async () => {
    const fake = new FakeSmsProvider('first');
    const signal = new AbortController().signal;

    await expect(fake.send(MESSAGE, signal)).resolves.toEqual({
      provider: 'first',
      messageId: 'first-1',
    });
    await expect(fake.send(MESSAGE, signal)).resolves.toEqual({
      provider: 'first',
      messageId: 'first-2',
    });
    expect(fake.sent).toEqual([MESSAGE, MESSAGE]);
  });

  it('fails the next calls in the order planned, then sends again', async () => {
    const fake = new FakeSmsProvider();
    const signal = new AbortController().signal;
    const retryable = new SmsError('unavailable');
    const final = new SmsError('insufficient-balance');
    fake.failNext(retryable).failNext(final);

    await expect(fake.send(MESSAGE, signal)).rejects.toBe(retryable);
    await expect(fake.send(MESSAGE, signal)).rejects.toBe(final);
    await expect(fake.send(MESSAGE, signal)).resolves.toEqual({
      provider: 'fake',
      messageId: 'fake-1',
    });
    expect(fake.calls).toHaveLength(3);
    expect(fake.sent).toHaveLength(1);
  });

  it('hangs until the call is aborted', async () => {
    const fake = new FakeSmsProvider().hangNext();
    const controller = new AbortController();

    const sending = fake.send(MESSAGE, controller.signal);
    controller.abort();

    await expect(sending).rejects.toThrow('aborted');
    expect(fake.aborted).toBe(1);
    expect(fake.sent).toEqual([]);
  });
});
