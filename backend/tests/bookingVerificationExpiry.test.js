import { describe, expect, it } from 'vitest';
import { bookingVerificationExpiry, BOOKING_VERIFICATION_TTL_SECONDS } from '../src/repositories/bookingVerificationRepository.js';

describe('booking verification expiry', () => {
  it('expires a verification code five minutes after issue', () => {
    const issuedAt = 1_800_000_000_000;
    expect(BOOKING_VERIFICATION_TTL_SECONDS).toBe(300);
    expect(bookingVerificationExpiry(issuedAt).getTime()).toBe(issuedAt + 5 * 60 * 1000);
  });
});
