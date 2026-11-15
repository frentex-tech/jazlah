import type { OtpCodeTarget } from '../otp-code-target.type';
import type { OtpCodes } from '../ports/otp-codes.port';

/**
 * Verification codes without cryptography: `generate` hands out `nextCodes` in order
 * (then `000000`), and a hash is readable text bound to the phone, audience and code.
 */
export class InMemoryOtpCodes implements OtpCodes {
  nextCodes: string[] = [];
  private unmatchable = 0;

  generate(): string {
    return this.nextCodes.shift() ?? '000000';
  }

  hash(target: OtpCodeTarget, code: string): string {
    return `hash(${target.phone}|${target.audience}|${code})`;
  }

  unmatchableHash(): string {
    this.unmatchable += 1;
    return `unmatchable-${this.unmatchable}`;
  }

  matches(target: OtpCodeTarget, code: string, hash: string): boolean {
    return this.hash(target, code) === hash;
  }
}
