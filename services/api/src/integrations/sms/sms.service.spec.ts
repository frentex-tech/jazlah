import { Logger } from '@nestjs/common';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { SmsConfig } from '@config/sms-config.type';
import { FakeSmsProvider } from './testing';
import { SmsConfigurationError, SmsError, SmsNotSentError } from './sms.errors';
import { SmsService } from './sms.service';

const TIMEOUT_MS = 1_000;
const CONFIG: SmsConfig = { providers: ['log'], providerTimeoutMs: TIMEOUT_MS };
/** An obviously fictitious number, in a local form the service normalises. */
const TO = '0512345678';
const TO_E164 = '+966512345678';
const TEXT = 'رمز التحقق: 4821';

function setup(...names: string[]): {
  service: SmsService;
  providers: FakeSmsProvider[];
} {
  const providers = names.map((name) => new FakeSmsProvider(name));
  return { service: new SmsService(providers, CONFIG), providers };
}

/** The error `promise` rejects with, as an SmsNotSentError. */
async function notSent(promise: Promise<unknown>): Promise<SmsNotSentError> {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(SmsNotSentError);
  return error as SmsNotSentError;
}

describe('SmsService', () => {
  let log: jest.SpyInstance;
  let warn: jest.SpyInstance;

  beforeEach(() => {
    log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('sends through the first provider, with the number in E.164, and tries no other', async () => {
    const { service, providers } = setup('first', 'second');

    const sent = await service.send({ to: TO, text: TEXT });

    expect(sent).toEqual({ provider: 'first', messageId: 'first-1' });
    expect(providers[0].sent).toEqual([{ to: TO_E164, text: TEXT }]);
    expect(providers[1].calls).toEqual([]);
  });

  it('moves to the next provider on a retryable failure', async () => {
    const { service, providers } = setup('first', 'second');
    providers[0].failNext(new SmsError('unavailable'));

    const sent = await service.send({ to: TO, text: TEXT });

    expect(sent).toEqual({ provider: 'second', messageId: 'second-1' });
    expect(providers[0].sent).toEqual([]);
    expect(providers[1].sent).toEqual([{ to: TO_E164, text: TEXT }]);
  });

  it.each(['unavailable', 'timeout', 'throttled', 'unknown'] as const)(
    'treats %s as retryable',
    async (reason) => {
      const { service, providers } = setup('first', 'second');
      providers[0].failNext(new SmsError(reason));

      await expect(service.send({ to: TO, text: TEXT })).resolves.toEqual({
        provider: 'second',
        messageId: 'second-1',
      });
    },
  );

  it('treats an error the provider did not map (undocumented) as retryable', async () => {
    const { service, providers } = setup('first', 'second');
    const undocumented = new Error('vendor said something new');
    providers[0].failNext(undocumented);

    await expect(service.send({ to: TO, text: TEXT })).resolves.toEqual({
      provider: 'second',
      messageId: 'second-1',
    });
  });

  it.each([
    'invalid-number',
    'sender-rejected',
    'invalid-message',
    'insufficient-balance',
  ] as const)(
    'stops on a non-retryable failure (%s): the next provider is never called',
    async (reason) => {
      const { service, providers } = setup('first', 'second');
      const failure = new SmsError(reason);
      providers[0].failNext(failure);

      const error = await notSent(service.send({ to: TO, text: TEXT }));

      expect(providers[1].calls).toEqual([]);
      expect(error.retryable).toBe(false);
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.failures).toEqual([{ provider: 'first', error: failure }]);
      expect(error.cause).toBe(failure);
    },
  );

  it('fails with every provider’s cause attached when all fail', async () => {
    const { service, providers } = setup('first', 'second', 'third');
    const unavailable = new SmsError('unavailable', {
      cause: new Error('ECONNRESET'),
    });
    const throttled = new SmsError('throttled');
    const undocumented = new Error('vendor said something new');
    providers[0].failNext(unavailable);
    providers[1].failNext(throttled);
    providers[2].failNext(undocumented);

    const error = await notSent(service.send({ to: TO, text: TEXT }));

    expect(error.failures.map((f) => [f.provider, f.error.reason])).toEqual([
      ['first', 'unavailable'],
      ['second', 'throttled'],
      ['third', 'unknown'],
    ]);
    expect(error.failures[0].error).toBe(unavailable);
    expect(error.failures[1].error).toBe(throttled);
    expect(error.failures[2].error.cause).toBe(undocumented);
    expect(error.message).toBe(
      'SERVICE_UNAVAILABLE: sms not sent: first unavailable, second throttled, third unknown',
    );
    expect(error.retryable).toBe(true);
    expect(error.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
  });

  describe('timeouts', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('gives up on a provider after SMS_PROVIDER_TIMEOUT_MS, aborts its call, and tries the next', async () => {
      const { service, providers } = setup('first', 'second');
      providers[0].hangNext();

      const sending = service.send({ to: TO, text: TEXT });
      await jest.advanceTimersByTimeAsync(TIMEOUT_MS - 1);
      expect(providers[1].calls).toEqual([]);
      await jest.advanceTimersByTimeAsync(1);

      await expect(sending).resolves.toEqual({
        provider: 'second',
        messageId: 'second-1',
      });
      expect(providers[0].aborted).toBe(1);
    });

    it('gives each provider its own timeout', async () => {
      const { service, providers } = setup('first', 'second');
      providers[0].hangNext();
      providers[1].hangNext();

      const sending = notSent(service.send({ to: TO, text: TEXT }));
      await jest.advanceTimersByTimeAsync(TIMEOUT_MS);
      expect(providers[1].calls).toHaveLength(1);
      await jest.advanceTimersByTimeAsync(TIMEOUT_MS - 1);
      expect(providers[1].aborted).toBe(0);
      await jest.advanceTimersByTimeAsync(1);

      const error = await sending;
      expect(error.failures.map((f) => [f.provider, f.error.reason])).toEqual([
        ['first', 'timeout'],
        ['second', 'timeout'],
      ]);
      expect(providers.map((p) => p.aborted)).toEqual([1, 1]);
    });
  });

  it('refuses to start with no provider', () => {
    expect(() => new SmsService([], CONFIG)).toThrow(SmsConfigurationError);
  });

  it.each([
    ['a landline', '0112345678'],
    ['another country', '+971501234567'],
    ['garbage', 'not a number'],
  ])('refuses %s before calling any provider', async (_label, to) => {
    const { service, providers } = setup('first');

    await expect(service.send({ to, text: TEXT })).rejects.toMatchObject({
      reason: 'invalid-number',
      retryable: false,
    });
    expect(providers[0].calls).toEqual([]);
  });

  it('refuses an empty text before calling any provider', async () => {
    const { service, providers } = setup('first');

    await expect(service.send({ to: TO, text: '' })).rejects.toMatchObject({
      reason: 'invalid-message',
    });
    expect(providers[0].calls).toEqual([]);
  });

  it('logs the provider that sent the message, the number masked and never the text', async () => {
    const { service, providers } = setup('first', 'second');
    providers[0].failNext(new SmsError('unavailable'));

    await service.send({ to: TO, text: TEXT });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(1);
    const [failed] = warn.mock.calls[0] as [Record<string, unknown>];
    const [sent, message] = log.mock.calls[0] as [
      Record<string, unknown>,
      string,
    ];
    process.stdout.write(
      `captured log lines:\n  ${JSON.stringify(failed)}\n  ${JSON.stringify(sent)} ${message}\n`,
    );
    expect(failed).toMatchObject({
      provider: 'first',
      reason: 'unavailable',
      retryable: true,
      to: '+966*******78',
    });
    expect(sent).toEqual({
      provider: 'second',
      messageId: 'second-1',
      to: '+966*******78',
      encoding: 'UCS-2',
      units: 16,
      segments: 1,
    });
    expect(message).toBe('SMS sent');
    const logged = JSON.stringify([
      warn.mock.calls as unknown,
      log.mock.calls as unknown,
    ]);
    expect(logged).not.toContain('4821');
    expect(logged).not.toContain('رمز');
    expect(logged).not.toContain('512345678');
  });
});
