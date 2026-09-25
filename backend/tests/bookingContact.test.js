import { describe, expect, it } from 'vitest';
import { bookingSchema } from '../src/validators/villaValidators.js';

const booking = {
  villaId: 101,
  bookingKind: 'overnight',
  guestName: 'Guest Example',
  guestEmail: 'guest@example.com',
  guestPhone: '+62 812-3456-7890',
  checkIn: '2030-06-10',
  checkOut: '2030-06-12',
  guests: 2
};

describe('booking contact number validation', () => {
  it('accepts an international guest phone number', () => {
    expect(bookingSchema.safeParse(booking).success).toBe(true);
  });

  it('requires a usable phone number', () => {
    expect(bookingSchema.safeParse({ ...booking, guestPhone: '' }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...booking, guestPhone: 'contact me' }).success).toBe(false);
  });
});
