import { OtpChallenge } from './otp-challenge.entity';

const CREATED = new Date('2026-11-14T09:00:00.000Z');
const EXPIRES = new Date('2026-11-14T09:05:00.000Z');

function challenge(
  change: { attempts?: number; consumedAt?: Date | null } = {},
): OtpChallenge {
  return new OtpChallenge(
    'challenge-1',
    '+966512345678',
    'customer',
    'hash',
    EXPIRES,
    change.attempts ?? 0,
    change.consumedAt ?? null,
    CREATED,
  );
}

function at(time: string): Date {
  return new Date(`2026-11-14T${time}Z`);
}

describe('OtpChallenge', () => {
  describe('state', () => {
    it('is usable while fresh, unconsumed and with attempts left', () => {
      expect(challenge({ attempts: 4 }).state(at('09:04:59.999'), 5)).toBe(
        'usable',
      );
    });

    it('is expired from the exact instant of its expiry', () => {
      expect(challenge().state(at('09:05:00.000'), 5)).toBe('expired');
      expect(challenge().state(at('09:30:00.000'), 5)).toBe('expired');
    });

    it('is exhausted once the attempts reach the maximum', () => {
      expect(challenge({ attempts: 5 }).state(at('09:01:00.000'), 5)).toBe(
        'exhausted',
      );
    });

    it('is consumed once a correct code was accepted, whatever else is true', () => {
      const consumed = challenge({ consumedAt: at('09:01:00.000') });

      expect(consumed.state(at('09:02:00.000'), 5)).toBe('consumed');
      expect(consumed.state(at('09:30:00.000'), 5)).toBe('consumed');
    });
  });

  describe('resendWaitSeconds', () => {
    it('is the whole wait right after the code was issued', () => {
      expect(challenge().resendWaitSeconds(at('09:00:00.000'), 60)).toBe(60);
    });

    it('rounds the time left up to a whole second', () => {
      expect(challenge().resendWaitSeconds(at('09:00:20.500'), 60)).toBe(40);
      expect(challenge().resendWaitSeconds(at('09:00:59.999'), 60)).toBe(1);
    });

    it('is zero from the end of the wait on', () => {
      expect(challenge().resendWaitSeconds(at('09:01:00.000'), 60)).toBe(0);
      expect(challenge().resendWaitSeconds(at('10:00:00.000'), 60)).toBe(0);
    });
  });
});
