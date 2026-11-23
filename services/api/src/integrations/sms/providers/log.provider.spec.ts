import { Logger } from '@nestjs/common';
import type { SmsPort } from '../sms.port';
import { LogSmsProvider } from './log.provider';

describe('LogSmsProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes the whole message, text included, to the log and returns its id', async () => {
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const provider: SmsPort = new LogSmsProvider();

    const sent = await provider.send(
      { to: '+966512345678', text: 'رمز التحقق: 4821' },
      new AbortController().signal,
    );

    expect(sent.provider).toBe('log');
    expect(sent.messageId).toMatch(/^log-[0-9a-f-]{36}$/);
    expect(log).toHaveBeenCalledWith(
      {
        messageId: sent.messageId,
        to: '+966512345678',
        text: 'رمز التحقق: 4821',
      },
      expect.any(String),
    );
  });

  it('gives each message its own id', async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const provider: SmsPort = new LogSmsProvider();
    const message = { to: '+966512345678', text: 'x' };
    const signal = new AbortController().signal;

    const first = await provider.send(message, signal);
    const second = await provider.send(message, signal);

    expect(first.messageId).not.toBe(second.messageId);
  });
});
