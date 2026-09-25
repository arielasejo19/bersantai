import { describe, expect, it } from 'vitest';
import { calculateReservationBalance } from '../src/repositories/billingRepository.js';
import { summarizeReservationRevenue } from '../src/repositories/villaRepository.js';

const reservation = { total_amount: 100, payment_status: 'paid' };

describe('reservation billing balance', () => {
  it('treats legacy paid bookings as room-paid while add-on charges are collected', () => {
    const charges = [{ item_type: 'service', total_amount: 20 }];
    const payments = [{ amount: 20, reference: 'Receipt 1' }];
    expect(calculateReservationBalance(reservation, charges, payments)).toMatchObject({ total: 120, paymentsTotal: 20, balance: 0 });
  });

  it('counts an initial booking payment once and leaves add-on balance due', () => {
    const charges = [{ item_type: 'prebooked_food', total_amount: 15 }, { item_type: 'food', total_amount: 20 }];
    const payments = [{ amount: 115, reference: 'Initial booking payment' }];
    expect(calculateReservationBalance(reservation, charges, payments)).toMatchObject({ includedChargesTotal: 15, chargesTotal: 20, total: 120, paymentsTotal: 115, balance: 5 });
  });

  it('ignores non-collected payment rows when calculating the balance', () => {
    const payments = [{ amount: 100, reference: null, status: 'failed' }];
    expect(calculateReservationBalance({ total_amount: 100, payment_status: 'unpaid' }, [], payments)).toMatchObject({ total: 100, paymentsTotal: 0, balance: 100 });
  });

  it('excludes food and service add-ons from host net revenue while keeping booking-level detail', () => {
    const reservation = { id: 11, total_amount: 250, guest_name: 'Ari', reference_number: 'RES-11', check_in: '2026-09-10', check_out: '2026-09-12', booking_status: 'confirmed' };
    const serviceTotals = 30;
    const foodTotals = 45;
    const collected = 175;
    expect(summarizeReservationRevenue(reservation, serviceTotals, foodTotals, collected)).toMatchObject({
      grossRevenue: 250,
      netHostRevenue: 175,
      collectedRevenue: 175,
      outstandingBalance: 0,
      guestName: 'Ari',
      referenceNumber: 'RES-11',
      bookingStatus: 'confirmed'
    });
  });
});
