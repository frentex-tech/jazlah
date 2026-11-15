import type { Audience } from '@common/auth/audience.type';
import type { OtpRequestLimit } from '../ports/otp-request-limit.port';

/** Records each counted phone and audience; `refuseWith` makes every later call reject. */
export class InMemoryOtpRequestLimit implements OtpRequestLimit {
  readonly counted: { phone: string; audience: Audience }[] = [];
  private refusal: Error | undefined;

  refuseWith(error: Error): void {
    this.refusal = error;
  }

  consume(phone: string, audience: Audience): Promise<void> {
    if (this.refusal !== undefined) {
      return Promise.reject(this.refusal);
    }
    this.counted.push({ phone, audience });
    return Promise.resolve();
  }
}
