import type { OtpSender } from '../ports/otp-sender.port';

/** Records the messages it is given; `failNext` makes the next send reject. */
export class InMemoryOtpSender implements OtpSender {
  readonly sent: { phone: string; text: string }[] = [];
  private failure: Error | undefined;

  failNext(error: Error): void {
    this.failure = error;
  }

  async send(phone: string, text: string): Promise<void> {
    // Asynchronous like a real sender, so callers cannot depend on synchronous effects.
    await Promise.resolve();
    if (this.failure !== undefined) {
      const failure = this.failure;
      this.failure = undefined;
      throw failure;
    }
    this.sent.push({ phone, text });
  }
}
