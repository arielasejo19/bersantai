import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';
import { calculateReservationBalance } from './billingRepository.js';

const activeStatuses = ['pending', 'confirmed', 'checked_in'];

function database() {
  const db = getDatabase();
  if (!db) throw new ApiError(503, 'Database is not configured');
  return db;
}

function day(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const stringValue = String(value ?? '');
  if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) return stringValue.slice(0, 10);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? stringValue.slice(0, 10) : parsed.toISOString().slice(0, 10);
}

export function reservationDatesOverlap(reservation, checkIn, checkOut, bookingKind = 'overnight') {
  const start = day(checkIn);
  const end = day(checkOut || checkIn);
  const bookedStart = day(reservation.check_in);
  const bookedEnd = day(reservation.check_out);
  const bookedDayTour = reservation.booking_kind === 'day_tour' || bookedStart === bookedEnd;
  const requestedDayTour = bookingKind === 'day_tour' || start === end;
  if (requestedDayTour) return bookedStart <= start && bookedEnd > start || (bookedDayTour && bookedStart === start);
  if (bookedDayTour) return bookedStart >= start && bookedStart < end;
  return bookedStart < end && bookedEnd > start;
}

export function availableInventoryVillaIds(units, reservations, checkIn, checkOut, bookingKind, excludeId) {
  const overlapping = reservations.filter((reservation) =>
    String(reservation.id) !== String(excludeId) && activeStatuses.includes(reservation.booking_status) &&
    reservationDatesOverlap(reservation, checkIn, checkOut, bookingKind)
  );
  const unitIds = new Set(units.map((unit) => String(unit.id)));
  const fixedIds = new Set(overlapping.filter((reservation) => reservation.villa_id && unitIds.has(String(reservation.villa_id))).map((reservation) => String(reservation.villa_id)));
  if (availableInventoryCount(units, reservations, checkIn, checkOut, bookingKind, excludeId) <= 0) return [];
  return units.filter((unit) => !fixedIds.has(String(unit.id))).map((unit) => String(unit.id));
}

export function availableInventoryCount(units, reservations, checkIn, checkOut, bookingKind, excludeId) {
  const overlapping = reservations.filter((reservation) =>
    String(reservation.id) !== String(excludeId) && activeStatuses.includes(reservation.booking_status) &&
    reservationDatesOverlap(reservation, checkIn, checkOut, bookingKind)
  );
  const unitIds = new Set(units.map((unit) => String(unit.id)));
  const assignedIds = new Set(overlapping.filter((reservation) => reservation.villa_id && unitIds.has(String(reservation.villa_id))).map((reservation) => String(reservation.villa_id)));
  const unassigned = overlapping.filter((reservation) => !reservation.villa_id);
  const start = new Date(`${day(checkIn)}T00:00:00Z`);
  const end = new Date(`${day(checkOut || checkIn)}T00:00:00Z`);
  let peakUnassigned = 0;
  for (let cursor = new Date(start); cursor < end || (cursor.getTime() === start.getTime() && start.getTime() === end.getTime()); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10);
    peakUnassigned = Math.max(peakUnassigned, unassigned.filter((reservation) => reservationDatesOverlap(reservation, date, date, 'day_tour')).length);
    if (bookingKind === 'day_tour') break;
  }
  return Math.max(0, units.length - assignedIds.size - peakUnassigned);
}

function reservationQuery(db) {
  return db('reservations')
    .leftJoin('villas', 'villas.id', 'reservations.villa_id')
    .leftJoin('villa_types', 'villa_types.id', 'reservations.villa_type_id')
    .leftJoin('users as confirmed_users', 'confirmed_users.id', 'reservations.confirmed_by_user_id')
    .leftJoin('profiles as confirmed_profiles', 'confirmed_profiles.user_id', 'confirmed_users.id')
    .leftJoin('users as assigned_users', 'assigned_users.id', 'reservations.assigned_by_user_id')
    .leftJoin('profiles as assigned_profiles', 'assigned_profiles.user_id', 'assigned_users.id')
    .leftJoin('users as checkin_users', 'checkin_users.id', 'reservations.checked_in_by_user_id')
    .leftJoin('profiles as checkin_profiles', 'checkin_profiles.user_id', 'checkin_users.id')
    .leftJoin('users as checkout_users', 'checkout_users.id', 'reservations.checked_out_by_user_id')
    .leftJoin('profiles as checkout_profiles', 'checkout_profiles.user_id', 'checkout_users.id')
    .select(
      'reservations.*', 'villas.name as villa_name', 'villas.location as villa_location',
      'villas.occupancy_status as villa_occupancy_status', 'villa_types.name as villa_type_name',
      'villas.standard_check_in as villa_check_in_time', 'villas.standard_check_out as villa_check_out_time',
      'villa_types.standard_check_in as type_check_in_time', 'villa_types.standard_check_out as type_check_out_time',
      'confirmed_profiles.display_name as confirmed_by_name', 'confirmed_users.email as confirmed_by_email',
      'assigned_profiles.display_name as assigned_by_name', 'assigned_users.email as assigned_by_email',
      'checkin_profiles.display_name as checked_in_by_name', 'checkin_users.email as checked_in_by_email',
      'checkout_profiles.display_name as checked_out_by_name', 'checkout_users.email as checked_out_by_email'
    );
}

async function assertAccess(db, reservationId, user) {
  const query = reservationQuery(db).where('reservations.id', reservationId);
  if (user.role === 'host') query.where('villas.owner_user_id', user.id);
  const reservation = await query.first();
  if (!reservation) throw new ApiError(404, 'Reservation not found');
  return reservation;
}

async function recordActivity(trx, reservation, userId, action, remarks = null, villaId = reservation.villa_id) {
  await trx('reservation_activity').insert({
    reservation_id: reservation.id, guest_user_id: reservation.guest_user_id || null,
    villa_id: villaId || null, staff_user_id: userId || null, action, remarks: remarks || null
  });
}

async function activeTypeReservations(query, villaTypeId) {
  return query
    .leftJoin('villas as reserved_villas', 'reserved_villas.id', 'reservations.villa_id')
    .whereIn('reservations.booking_status', activeStatuses)
    .where((builder) => builder.where('reservations.villa_type_id', villaTypeId).orWhere('reserved_villas.villa_type_id', villaTypeId))
    .select('reservations.id', 'reservations.villa_id', 'reservations.villa_type_id', 'reservations.booking_status', 'reservations.booking_kind', 'reservations.check_in', 'reservations.check_out');
}

async function typeInventory(trx, villaTypeId, checkIn, checkOut, bookingKind, excludeId) {
  const type = await trx('villa_types').where({ id: villaTypeId, is_active: true, status: 'active' }).first();
  if (!type) throw new ApiError(404, 'This villa type is not available for booking');
  const units = type.availability_status === 'available'
    ? await trx('villas').where({ villa_type_id: villaTypeId, status: 'active', availability_status: 'available' }).select('id', 'name', 'capacity', 'nightly_price')
    : [];
  const reservations = await activeTypeReservations(trx('reservations'), villaTypeId);
  return {
    type, units, reservations,
    availableUnits: availableInventoryCount(units, reservations, checkIn, checkOut, bookingKind, excludeId)
  };
}

export async function getVillaTypeAvailability(villaTypeId, checkIn, checkOut, bookingKind = 'overnight', excludeId) {
  return typeInventory(database(), villaTypeId, checkIn, checkOut || checkIn, bookingKind, excludeId);
}

async function detailWithin(db, reservationId, user) {
  const reservation = await assertAccess(db, reservationId, user);
  const [activity, emails] = await Promise.all([
    db('reservation_activity')
      .leftJoin('users as staff_users', 'staff_users.id', 'reservation_activity.staff_user_id')
      .leftJoin('profiles as staff_profiles', 'staff_profiles.user_id', 'staff_users.id')
      .leftJoin('villas as event_villas', 'event_villas.id', 'reservation_activity.villa_id')
      .where({ reservation_id: reservationId })
      .orderBy('occurred_at', 'asc')
      .select('reservation_activity.*', 'event_villas.name as event_villa_name', 'staff_profiles.display_name as staff_name', 'staff_users.email as staff_email', 'staff_users.role as staff_role'),
    db('reservation_emails').where({ reservation_id: reservationId }).orderBy('id', 'desc')
  ]);
  return {
    ...reservation,
    id: String(reservation.id),
    villa_id: reservation.villa_id ? String(reservation.villa_id) : null,
    villa_type_id: reservation.villa_type_id ? String(reservation.villa_type_id) : null,
    guest_user_id: reservation.guest_user_id ? String(reservation.guest_user_id) : null,
    booking_mode: reservation.booking_mode || (reservation.villa_id ? 'airbnb' : 'hotel'),
    guests: Number(reservation.guests || 1),
    total_amount: Number(reservation.total_amount || 0),
    actual_check_in: reservation.checked_in_at || null,
    actual_check_out: reservation.checked_out_at || null,
    activity: activity.map((item) => ({ ...item, id: String(item.id), reservation_id: String(item.reservation_id), villa_id: item.villa_id ? String(item.villa_id) : null, staff_user_id: item.staff_user_id ? String(item.staff_user_id) : null })),
    emails: emails.map((item) => ({ id: String(item.id), template: item.template, recipient: item.recipient, status: item.status, attemptedAt: item.attempted_at, sentAt: item.sent_at, errorMessage: item.error_message || null }))
  };
}

export async function getReservationDetails(reservationId, user) {
  return detailWithin(database(), reservationId, user);
}

export async function getAssignableVillas(reservationId, user) {
  const db = database();
  const reservation = await assertAccess(db, reservationId, user);
  if ((reservation.booking_mode || (reservation.villa_id ? 'airbnb' : 'hotel')) !== 'hotel' || !reservation.villa_type_id) {
    throw new ApiError(400, 'Villa assignment is only available for Hotel Mode reservations');
  }
  if (reservation.booking_status !== 'confirmed') throw new ApiError(409, 'Only confirmed bookings can be assigned a villa');
  const { units, reservations } = await typeInventory(db, reservation.villa_type_id, reservation.check_in, reservation.check_out, reservation.booking_kind, reservationId);
  const availableIds = new Set(availableInventoryVillaIds(units, reservations, reservation.check_in, reservation.check_out, reservation.booking_kind, reservationId));
  return units.filter((villa) => availableIds.has(String(villa.id))).map((villa) => ({ id: String(villa.id), name: villa.name, capacity: villa.capacity, nightlyPrice: Number(villa.nightly_price || 0), isAssigned: String(reservation.villa_id || '') === String(villa.id) }));
}

export async function confirmReservation(reservationId, user) {
  const db = database();
  await db.transaction(async (trx) => {
    const reservation = await trx('reservations').where({ id: reservationId }).forUpdate().first();
    if (!reservation) throw new ApiError(404, 'Reservation not found');
    await assertAccess(trx, reservationId, user);
    if (reservation.booking_status !== 'pending') throw new ApiError(409, 'Only pending bookings can be confirmed');
    if (!reservation.reference_number || !reservation.guest_name?.trim() || !reservation.guest_email?.trim() || !reservation.check_in || !reservation.check_out || Number(reservation.guests) < 1 || Number(reservation.total_amount) < 0) {
      throw new ApiError(400, 'Complete the guest, stay, and booking amount details before confirmation');
    }
    const mode = reservation.booking_mode || (reservation.villa_id ? 'airbnb' : 'hotel');
    if (mode === 'hotel' && !reservation.villa_type_id) throw new ApiError(400, 'Hotel Mode bookings must have a villa type');
    if (mode === 'airbnb' && !reservation.villa_id) throw new ApiError(400, 'Airbnb Mode bookings must have a selected villa');
    const timestamp = trx.fn.now();
    await trx('reservations').where({ id: reservationId }).update({ booking_status: 'confirmed', status: 'confirmed', confirmed_at: timestamp, confirmed_by_user_id: user.id });
    await recordActivity(trx, reservation, user.id, 'booking-confirmed');
  });
  return getReservationDetails(reservationId, user);
}

export async function assignVillaToReservation(reservationId, villaId, user) {
  const db = database();
  await db.transaction(async (trx) => {
    const reservation = await trx('reservations').where({ id: reservationId }).forUpdate().first();
    if (!reservation) throw new ApiError(404, 'Reservation not found');
    await assertAccess(trx, reservationId, user);
    if ((reservation.booking_mode || (reservation.villa_id ? 'airbnb' : 'hotel')) !== 'hotel' || !reservation.villa_type_id) throw new ApiError(400, 'Only Hotel Mode bookings can be assigned a villa');
    if (reservation.booking_status !== 'confirmed') throw new ApiError(409, 'Only confirmed bookings can be assigned a villa');
    const type = await trx('villa_types').where({ id: reservation.villa_type_id }).forUpdate().first();
    if (!type || !type.is_active || type.status !== 'active' || type.availability_status !== 'available') throw new ApiError(409, 'The booked villa type is not active');
    const villa = await trx('villas').where({ id: villaId }).forUpdate().first();
    if (!villa || String(villa.villa_type_id) !== String(reservation.villa_type_id)) throw new ApiError(400, 'Select an active villa belonging to the booked villa type');
    if (villa.status !== 'active' || villa.availability_status !== 'available') throw new ApiError(409, 'This villa is inactive, unavailable, or under maintenance');
    const candidates = await trx('villas').where({ villa_type_id: reservation.villa_type_id, status: 'active', availability_status: 'available' }).forUpdate().select('id');
    const overlaps = await activeTypeReservations(trx('reservations'), reservation.villa_type_id);
    const availableIds = availableInventoryVillaIds(candidates, overlaps, reservation.check_in, reservation.check_out, reservation.booking_kind, reservationId);
    if (!availableIds.includes(String(villaId))) throw new ApiError(409, 'This villa is already occupied or reserved for overlapping dates');
    const previousVillaId = reservation.villa_id;
    await trx('reservations').where({ id: reservationId }).update({ villa_id: villaId, assigned_at: trx.fn.now(), assigned_by_user_id: user.id });
    await recordActivity(trx, reservation, user.id, previousVillaId ? 'villa-reassigned' : 'villa-assigned', null, villaId);
  });
  return getReservationDetails(reservationId, user);
}

export async function checkInReservation(reservationId, remarks, user) {
  const db = database();
  await db.transaction(async (trx) => {
    const reservation = await trx('reservations').where({ id: reservationId }).forUpdate().first();
    if (!reservation) throw new ApiError(404, 'Reservation not found');
    await assertAccess(trx, reservationId, user);
    if (reservation.booking_status !== 'confirmed') throw new ApiError(409, 'Only confirmed reservations can be checked in');
    if (!reservation.guest_name?.trim() || !reservation.guest_email?.trim() || Number(reservation.guests) < 1 || !reservation.check_in || !reservation.check_out) throw new ApiError(400, 'Guest and stay details must be complete before check-in');
    const mode = reservation.booking_mode || (reservation.villa_id ? 'airbnb' : 'hotel');
    if (mode === 'hotel' && !reservation.villa_id) throw new ApiError(409, 'Assign a villa before checking in this Hotel Mode booking');
    if (day(reservation.check_in) > new Date().toISOString().slice(0, 10)) throw new ApiError(409, 'Check-in is not available before the scheduled arrival date');
    const villa = await trx('villas').where({ id: reservation.villa_id }).forUpdate().first();
    if (!villa || villa.status !== 'active' || villa.availability_status !== 'available') throw new ApiError(409, 'The assigned villa is inactive or unavailable');
    if (reservation.villa_type_id && String(villa.villa_type_id) !== String(reservation.villa_type_id)) throw new ApiError(409, 'The assigned villa no longer matches the booked villa type');
    const conflicts = await trx('reservations').where({ villa_id: reservation.villa_id }).whereIn('booking_status', activeStatuses).whereNot('id', reservationId).select('id', 'booking_status', 'booking_kind', 'check_in', 'check_out');
    if (conflicts.some((other) => reservationDatesOverlap(other, reservation.check_in, reservation.check_out, reservation.booking_kind))) throw new ApiError(409, 'The assigned villa has another overlapping reservation');
    if (villa.occupancy_status === 'occupied') throw new ApiError(409, 'The assigned villa is currently occupied');
    await trx('reservations').where({ id: reservationId }).update({ booking_status: 'checked_in', status: 'checked_in', checked_in_at: trx.fn.now(), checked_in_by_user_id: user.id, check_in_remarks: remarks || null });
    await trx('villas').where({ id: villa.id }).update({ occupancy_status: 'occupied' });
    await recordActivity(trx, reservation, user.id, 'check-in', remarks, villa.id);
  });
  return getReservationDetails(reservationId, user);
}

async function statementFor(trx, reservation) {
  const [charges, payments] = await Promise.all([
    trx('reservation_charges').where({ reservation_id: reservation.id }).orderBy('created_at', 'asc'),
    trx('reservation_payments').where({ reservation_id: reservation.id, status: 'collected' }).orderBy('collected_at', 'asc')
  ]);
  return { ...calculateReservationBalance(reservation, charges, payments), charges, payments };
}

export async function checkOutReservation(reservationId, remarks, user) {
  const db = database();
  let finalStatement;
  await db.transaction(async (trx) => {
    const reservation = await trx('reservations').where({ id: reservationId }).forUpdate().first();
    if (!reservation) throw new ApiError(404, 'Reservation not found');
    await assertAccess(trx, reservationId, user);
    if (reservation.booking_status !== 'checked_in') throw new ApiError(409, 'Only checked-in reservations can be checked out');
    finalStatement = await statementFor(trx, reservation);
    if (finalStatement.balance > 0.005) throw new ApiError(409, `Outstanding balance of ${finalStatement.balance.toFixed(2)} must be settled before check-out`);
    await trx('reservations').where({ id: reservationId }).update({ booking_status: 'checked_out', status: 'checked_out', checked_out_at: trx.fn.now(), checked_out_by_user_id: user.id, check_out_remarks: remarks || null });
    await trx('villas').where({ id: reservation.villa_id }).update({ occupancy_status: 'available' });
    await recordActivity(trx, reservation, user.id, 'check-out', remarks, reservation.villa_id);
  });
  return { reservation: await getReservationDetails(reservationId, user), statement: finalStatement };
}

export async function changeReservationState(reservationId, status, user) {
  const db = database();
  await db.transaction(async (trx) => {
    const reservation = await trx('reservations').where({ id: reservationId }).forUpdate().first();
    if (!reservation) throw new ApiError(404, 'Reservation not found');
    await assertAccess(trx, reservationId, user);
    if (status === 'cancelled') {
      if (!['pending', 'confirmed'].includes(reservation.booking_status)) throw new ApiError(409, 'Only pending or confirmed bookings can be cancelled');
      await trx('reservations').where({ id: reservationId }).update({ booking_status: 'cancelled', status: 'cancelled' });
      await recordActivity(trx, reservation, user.id, 'booking-cancelled');
      return;
    }
    if (status === 'no_show') {
      if (reservation.booking_status !== 'confirmed' || day(reservation.check_in) >= new Date().toISOString().slice(0, 10)) throw new ApiError(409, 'A booking can only be marked No Show after its scheduled check-in date');
      await trx('reservations').where({ id: reservationId }).update({ booking_status: 'no_show', status: 'no_show' });
      await recordActivity(trx, reservation, user.id, 'booking-no-show');
      return;
    }
    if (status === 'reopen') {
      if (user.role !== 'admin') throw new ApiError(403, 'Only an admin can reopen a completed booking');
      if (!['checked_out', 'cancelled', 'no_show'].includes(reservation.booking_status)) throw new ApiError(409, 'Only a completed, cancelled, or no-show booking can be reopened');
      if (reservation.villa_id) {
        const villa = await trx('villas').where({ id: reservation.villa_id }).forUpdate().first();
        if (!villa || villa.status !== 'active' || villa.availability_status !== 'available' || villa.occupancy_status === 'occupied') {
          throw new ApiError(409, 'The assigned villa is no longer available for this booking');
        }
        const conflicts = await trx('reservations')
          .where({ villa_id: reservation.villa_id })
          .whereIn('booking_status', activeStatuses)
          .whereNot('id', reservationId)
          .select('id', 'booking_status', 'booking_kind', 'check_in', 'check_out');
        if (conflicts.some((other) => reservationDatesOverlap(other, reservation.check_in, reservation.check_out, reservation.booking_kind))) {
          throw new ApiError(409, 'The assigned villa has another overlapping reservation');
        }
      }
      const patch = { booking_status: 'confirmed', status: 'confirmed', confirmed_at: trx.fn.now(), confirmed_by_user_id: user.id, checked_in_at: null, checked_in_by_user_id: null, check_in_remarks: null, checked_out_at: null, checked_out_by_user_id: null, check_out_remarks: null };
      await trx('reservations').where({ id: reservationId }).update(patch);
      await recordActivity(trx, reservation, user.id, 'booking-reopened', 'Reopened by an administrator');
      return;
    }
    throw new ApiError(400, 'Use the dedicated confirmation, check-in, or check-out action');
  });
  return getReservationDetails(reservationId, user);
}

export async function logReservationEmailAttempt(reservationId, template, recipient, status, errorMessage = null) {
  const db = database();
  await db('reservation_emails').insert({ reservation_id: reservationId, recipient, template, status, sent_at: status === 'sent' ? db.fn.now() : null, error_message: errorMessage });
}

export async function listAvailableUnitsByDate(input) {
  const db = database();
  const start = new Date(`${input.startDate}T00:00:00Z`);
  const end = new Date(`${input.endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return { unavailableDates: [], availableUnitsByDate: {} };
  const typeBooking = Boolean(input.villaTypeId);
  const unit = typeBooking
    ? await typeInventory(db, input.villaTypeId, input.startDate, input.endDate, input.bookingKind || 'overnight')
    : null;
  let selectedVillaInventory = null;
  let villaAvailable = true;
  if (!typeBooking) {
    const villa = await db('villas').leftJoin('villa_types', 'villa_types.id', 'villas.villa_type_id')
      .where({ 'villas.id': input.villaId, 'villas.status': 'active', 'villas.availability_status': 'available' })
      .where((query) => query.whereNull('villa_types.id').orWhere((builder) => builder.where({ 'villa_types.is_active': true, 'villa_types.status': 'active', 'villa_types.availability_status': 'available' })))
      .first('villas.id', 'villas.villa_type_id');
    villaAvailable = Boolean(villa);
    if (villaAvailable && villa.villa_type_id) selectedVillaInventory = await typeInventory(db, villa.villa_type_id, input.startDate, input.endDate, input.bookingKind || 'overnight');
  }
  const villas = typeBooking ? unit.units : selectedVillaInventory?.units || [];
  const reservations = typeBooking ? unit.reservations : selectedVillaInventory?.reservations || await db('reservations').where({ villa_id: input.villaId }).whereIn('booking_status', activeStatuses).select('id', 'villa_id', 'booking_status', 'booking_kind', 'check_in', 'check_out');
  const availableUnitsByDate = {};
  const unavailableDates = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10);
    if (typeBooking) {
      availableUnitsByDate[date] = availableInventoryCount(villas, reservations, date, date, 'day_tour');
    } else if (selectedVillaInventory) {
      const eligibleIds = availableInventoryVillaIds(villas, reservations, date, date, 'day_tour');
      availableUnitsByDate[date] = eligibleIds.includes(String(input.villaId)) ? 1 : 0;
    } else {
      const conflict = reservations.some((reservation) => activeStatuses.includes(reservation.booking_status) && reservationDatesOverlap(reservation, date, input.bookingKind === 'day_tour' ? date : `${date}T00:00:00.000Z`, input.bookingKind || 'overnight'));
      availableUnitsByDate[date] = !villaAvailable || conflict ? 0 : 1;
    }
    if (availableUnitsByDate[date] <= 0) unavailableDates.push(date);
  }
  return { unavailableDates, availableUnitsByDate };
}
