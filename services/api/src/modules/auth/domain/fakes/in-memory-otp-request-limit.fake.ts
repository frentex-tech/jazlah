import type { OtpRequestLimit } from '../ports/otp-request-limit.port';

/** Records each counted phone; `refuseWith` makes every later call reject. */
export class InMemoryOtpRequestLimit implements OtpRequestLimit {
  readonly counted: string[] = [];
  private refusal: Error | undefined;

  refuseWith(error: Error): void {
    this.refusal = error;
  }

  consume(phone: string): Promise<void> {
    if (this.refusal !== undefined) {
      return Promise.reject(this.refusal);
    }
    this.counted.push(phone);
    return Promise.resolve();
  }
}
