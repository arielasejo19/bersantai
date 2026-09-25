import { describe, expect, it } from 'vitest';
import { availableInventoryCount, availableInventoryVillaIds, reservationDatesOverlap } from '../src/repositories/reservationRepository.js';
import { isSingleVillaTypeBooking, resolveAssignedVillaId } from '../src/repositories/villaRepository.js';

const units = [{ id: 101 }, { id: 102 }, { id: 103 }];
const booking = (id, check_in, check_out, villa_id = null, booking_status = 'confirmed', booking_kind = 'overnight') => ({ id, check_in, check_out, villa_id, booking_status, booking_kind });

describe('reservation inventory', () => {
  it('counts assigned units and peak overlapping unassigned Hotel Mode bookings', () => {
    const reservations = [
      booking(1, '2026-09-25', '2026-09-27', 101),
      booking(2, '2026-09-25', '2026-09-27'),
      booking(3, '2026-09-26', '2026-09-28')
    ];
    expect(availableInventoryCount(units, reservations, '2026-09-25', '2026-09-28', 'overnight')).toBe(0);
    expect(availableInventoryCount(units, reservations.slice(0, 2), '2026-09-25', '2026-09-28', 'overnight')).toBe(1);
  });

  it('reuses inventory for sequential unassigned stays within one requested range', () => {
    const reservations = [
      booking(1, '2026-09-25', '2026-09-26'),
      booking(2, '2026-09-26', '2026-09-27')
    ];
    expect(availableInventoryCount([{ id: 101 }, { id: 102 }], reservations, '2026-09-25', '2026-09-27', 'overnight')).toBe(1);
  });

  it('offers only non-conflicting actual villas for Hotel Mode assignment', () => {
    const reservations = [booking(1, '2026-09-25', '2026-09-27', 101)];
    expect(availableInventoryVillaIds(units, reservations, '2026-09-25', '2026-09-27', 'overnight')).toEqual(['102', '103']);
  });

  it('keeps Airbnb villa overlap exclusive to the selected physical villa', () => {
    const reservations = [booking(1, '2026-09-25', '2026-09-27', 101)];
    expect(availableInventoryVillaIds(units, reservations, '2026-09-25', '2026-09-27', 'overnight')).not.toContain('101');
    expect(availableInventoryVillaIds(units, reservations, '2026-09-25', '2026-09-27', 'overnight')).toContain('102');
  });

  it('treats the dining pavilion as a unique single-villa hotel booking even with multiple villas in the type', () => {
    expect(isSingleVillaTypeBooking({ slug: 'dining-pavilion', name: 'Dining Pavilion' }, 3)).toBe(true);
    expect(isSingleVillaTypeBooking({ slug: 'garden-villa', name: 'Garden Villa' }, 1)).toBe(true);
    expect(isSingleVillaTypeBooking({ slug: 'garden-villa', name: 'Garden Villa' }, 3)).toBe(false);
  });

  it('keeps hotel-mode type bookings unassigned until staff assigns a villa', () => {
    expect(resolveAssignedVillaId({ villaId: null, villaTypeId: 8, operatingMode: 'hotel' }, { id: 42 })).toBeNull();
    expect(resolveAssignedVillaId({ villaId: 24, villaTypeId: 8, operatingMode: 'hotel' }, { id: 42 })).toBe(24);
  });

  it('uses hotel night boundaries and blocks day tours on occupied dates', () => {
    const overnight = booking(1, '2026-09-25', '2026-09-26');
    expect(reservationDatesOverlap(overnight, '2026-09-26', '2026-09-26', 'day_tour')).toBe(false);
    expect(reservationDatesOverlap(booking(2, '2026-09-25', '2026-09-25', null, 'confirmed', 'day_tour'), '2026-09-25', '2026-09-26', 'overnight')).toBe(true);
  });
});
