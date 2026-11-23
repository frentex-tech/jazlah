import type { SmsPort } from '../sms.port';
import type { SmsMessage, SmsSent } from '../sms.types';

/** What the next call does instead of sending: reject with an error, or never answer. */
type Planned = Readonly<{ fail: unknown }> | 'hang';

/**
 * The sms port in memory, for tests: no network, deterministic message ids
 * (`<name>-1`, `<name>-2`, …), every message it accepted kept in `sent`, every call in
 * `calls`. Give each instance its own name to build an ordered list.
 *
 * To test fallback, plan what the next calls do, in order: `failNext(error)` rejects
 * with `error` (an SmsError, retryable or not, or anything else, which the service
 * treats as undocumented); `hangNext()` never answers until the service aborts the
 * call (`aborted` counts those aborts), for timeouts.
 *
 * Exported from the integration's `testing.ts` (R22); production code never sees it.
 */
export class FakeSmsProvider implements SmsPort {
  /** Every message accepted, in order. */
  readonly sent: SmsMessage[] = [];
  /** Every message the service tried to send through this provider, in order. */
  readonly calls: SmsMessage[] = [];
  /** How many calls the service aborted (its timeout) before they settled. */
  aborted = 0;
  private readonly planned: Planned[] = [];

  constructor(readonly name = 'fake') {}

  /** The next unplanned call rejects with `error`. Calls queue up in order. */
  failNext(error: unknown): this {
    this.planned.push({ fail: error });
    return this;
  }

  /** The next unplanned call never settles; it rejects only once its signal aborts. */
  hangNext(): this {
    this.planned.push('hang');
    return this;
  }

  async send(message: SmsMessage, signal: AbortSignal): Promise<SmsSent> {
    this.calls.push(message);
    const plan = this.planned.shift();
    if (plan === 'hang') {
      return new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () => {
          this.aborted += 1;
          reject(new Error('aborted'));
        });
      });
    }
    // Asynchronous like a real provider, so callers cannot depend on synchronous effects.
    await Promise.resolve();
    if (plan !== undefined) {
      throw plan.fail;
    }
    this.sent.push(message);
    return {
      provider: this.name,
      messageId: `${this.name}-${this.sent.length}`,
    };
  }
}
