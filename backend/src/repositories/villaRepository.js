import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

function database() {
  const db = getDatabase();
  if (!db) throw new ApiError(503, 'Database is not configured');
  return db;
}

function accessQuery(query, user) {
  if (user.role === 'admin') return query;
  if (user.role === 'host') return query.where('villas.owner_user_id', user.id);
  return query
    .join('villa_receptionist_assignments as assignments', 'assignments.villa_id', 'villas.id')
    .where('assignments.user_id', user.id);
}

function toVilla(row, amenities = [], photos = []) {
  return {
    id: String(row.id), name: row.name, slug: row.slug, location: row.location,
    villaType: row.villa_type_id ? { id: String(row.villa_type_id), name: row.villa_type_name, slug: row.villa_type_slug, dayTourOnly: Boolean(row.villa_type_day_tour_only), defaultImageUrl: row.villa_type_default_image } : null,
    description: row.description, nightlyPrice: Number(row.nightly_price), capacity: row.capacity,
    bedroomCount: row.bedroom_count, status: row.status, availabilityStatus: row.availability_status,
    owner: row.owner_user_id ? { id: String(row.owner_user_id), email: row.owner_email, displayName: row.owner_name } : null,
    amenities, photos, createdAt: row.created_at, updatedAt: row.updated_at
  };
}

async function related(db, villaId) {
  const [amenities, photos] = await Promise.all([
    db('villa_amenities').where({ villa_id: villaId }).orderBy('name').select('id', 'name'),
    db('villa_photos').where({ villa_id: villaId }).orderBy([{ column: 'is_thumbnail', order: 'desc' }, { column: 'sort_order', order: 'asc' }]).select('id', 'url', 'media_type as mediaType', 'alt_text as altText', 'is_thumbnail as isThumbnail', 'sort_order as sortOrder')
  ]);
  return { amenities: amenities.map((item) => ({ ...item, id: String(item.id) })), photos: photos.map((item) => ({ ...item, id: String(item.id) })) };
}

function baseQuery(db) {
  return db('villas')
    .leftJoin('villa_types', 'villa_types.id', 'villas.villa_type_id')
    .leftJoin('users as owners', 'owners.id', 'villas.owner_user_id')
    .leftJoin('profiles as owner_profiles', 'owner_profiles.user_id', 'villas.owner_user_id')
    .select('villas.*', 'villa_types.name as villa_type_name', 'villa_types.slug as villa_type_slug', 'villa_types.day_tour_only as villa_type_day_tour_only', 'villa_types.default_image_url as villa_type_default_image', 'owners.email as owner_email', 'owner_profiles.display_name as owner_name');
}

export async function listVillasForUser(user) {
  const db = database();
  const rows = await accessQuery(baseQuery(db), user).distinct('villas.id').orderBy('villas.created_at', 'desc');
  return Promise.all(rows.map(async (row) => {
    const items = await related(db, row.id);
    return toVilla(row, items.amenities, items.photos);
  }));
}

export async function listPublicVillas() {
  const db = database();
  const rows = await baseQuery(db)
    .where('villas.status', 'active')
    .where('villas.availability_status', 'available')
    .where((builder) => builder.whereNull('villa_types.id').orWhere('villa_types.is_active', true).andWhere('villa_types.status', 'active').andWhere('villa_types.availability_status', 'available'))
    .orderBy('villas.created_at', 'desc');

  return Promise.all(rows.map(async (row) => {
    const items = await related(db, row.id);
    return toVilla(row, items.amenities, items.photos);
  }));
}

export async function findPublicVilla(villaId) {
  const db = database();
  const row = await baseQuery(db).where('villas.id', villaId).where('villas.status', 'active').where('villas.availability_status', 'available').where((builder) => builder.whereNull('villa_types.id').orWhere('villa_types.is_active', true).andWhere('villa_types.status', 'active').andWhere('villa_types.availability_status', 'available')).first();
  if (!row) throw new ApiError(404, 'Villa not found');
  const items = await related(db, row.id);
  return toVilla(row, items.amenities, items.photos);
}

export async function checkPublicAvailability(input) {
  const db = database();
  const checkOut = input.checkOut || input.checkIn;
  const query = db('reservations').whereIn('booking_status', ['pending', 'confirmed', 'checked_in']).where('check_in', '<=', checkOut).where('check_out', '>=', input.checkIn);
  if (input.villaTypeId) {
    const [{ count: rooms }] = await db('villas').join('villa_types', 'villa_types.id', 'villas.villa_type_id').where({ 'villas.villa_type_id': input.villaTypeId, 'villas.status': 'active', 'villas.availability_status': 'available', 'villa_types.is_active': true, 'villa_types.status': 'active', 'villa_types.availability_status': 'available' }).count({ count: '*' });
    const [{ count: bookings }] = await query.where({ villa_type_id: input.villaTypeId }).count({ count: '*' });
    return { available: Number(bookings) < Number(rooms) };
  }
  if (input.bookingKind === 'day_tour') return { available: true };
  return { available: !(await query.where({ villa_id: input.villaId }).first()) };
}

export async function findVillaForUser(villaId, user) {
  const db = database();
  const row = await accessQuery(baseQuery(db).where('villas.id', villaId), user).first();
  if (!row) throw new ApiError(404, 'Villa not found');
  const items = await related(db, row.id);
  return toVilla(row, items.amenities, items.photos);
}

export async function createVilla(input) {
  const db = database();
  return db.transaction(async (trx) => {
    const [id] = await trx('villas').insert({
      name: input.name, slug: input.slug, location: input.location, description: input.description,
      nightly_price: input.nightlyPrice, capacity: input.capacity, bedroom_count: input.bedroomCount,
      status: input.status, availability_status: input.availabilityStatus, owner_user_id: input.ownerUserId, villa_type_id: input.villaTypeId || null
    });

    if (input.amenities?.length) {
      await trx('villa_amenities').insert(input.amenities.map((name) => ({ villa_id: id, name })));
    }

    if (input.photos?.length) {
      const thumbnailIndex = input.photos.findIndex((photo) => photo.isThumbnail);
      await trx('villa_photos').insert(input.photos.map((photo, index) => ({ villa_id: id, url: photo.url, media_type: photo.mediaType, alt_text: photo.altText, is_thumbnail: thumbnailIndex < 0 ? index === 0 : index === thumbnailIndex, sort_order: photo.sortOrder ?? index })));
    }

    return id;
  });
}

export async function updateVilla(villaId, input) {
  const db = database();
  await db.transaction(async (trx) => {
    await trx('villas').where({ id: villaId }).update({
      name: input.name, slug: input.slug, location: input.location, description: input.description,
      nightly_price: input.nightlyPrice, capacity: input.capacity, bedroom_count: input.bedroomCount,
      status: input.status, availability_status: input.availabilityStatus, owner_user_id: input.ownerUserId, villa_type_id: input.villaTypeId || null
    });
    if (input.amenities) {
      await trx('villa_amenities').where({ villa_id: villaId }).del();
      if (input.amenities.length) await trx('villa_amenities').insert(input.amenities.map((name) => ({ villa_id: villaId, name })));
    }
    if (input.photos) {
      await trx('villa_photos').where({ villa_id: villaId }).del();
      if (input.photos.length) {
        const thumbnailIndex = input.photos.findIndex((photo) => photo.isThumbnail);
        await trx('villa_photos').insert(input.photos.map((photo, index) => ({ villa_id: villaId, url: photo.url, media_type: photo.mediaType, alt_text: photo.altText, is_thumbnail: thumbnailIndex < 0 ? index === 0 : index === thumbnailIndex, sort_order: photo.sortOrder ?? index })));
      }
    }
  });
}

export async function addAmenity(villaId, name) {
  const db = database();
  await db('villa_amenities').insert({ villa_id: villaId, name });
}

export async function addPhoto(villaId, input) {
  const db = database();
  await db('villa_photos').insert({ villa_id: villaId, url: input.url, media_type: input.mediaType || 'image', alt_text: input.altText, is_thumbnail: Boolean(input.isThumbnail), sort_order: input.sortOrder });
}

export async function assignReceptionist(villaId, userId) {
  const db = database();
  await db('villa_receptionist_assignments').insert({ villa_id: villaId, user_id: userId });
}

export async function listReservationsForUser(villaId, user) {
  const db = database();
  const scope = accessQuery(db('villas').select('villas.id').where('villas.id', villaId), user);
  const allowed = await scope.first();
  if (!allowed) throw new ApiError(404, 'Villa not found');
  const rows = await db('reservations').where({ villa_id: villaId }).orderBy('check_in');
  return rows.map((row) => ({ ...row, id: String(row.id), villaId: String(row.villa_id), guestUserId: row.guest_user_id ? String(row.guest_user_id) : null }));
}

export async function listReservationsForRole(user) {
  const db = database();
  let query = db('reservations')
    .leftJoin('villas', 'villas.id', 'reservations.villa_id')
    .leftJoin('villa_types', 'villa_types.id', 'reservations.villa_type_id')
    .select('reservations.*', 'villas.name as villa_name', 'villa_types.name as villa_type_name')
    .orderBy('reservations.check_in');
  if (user.role === 'host') query = query.where('villas.owner_user_id', user.id);
  if (user.role === 'receptionist') query = query.where((builder) => builder.whereNotNull('reservations.villa_id').orWhereExists(db.select('*').from('villa_receptionist_assignments as assignments').whereRaw('assignments.villa_id = reservations.villa_id').andWhere('assignments.user_id', user.id)));
  return query;
}

export async function updateReservation(reservationId, input, user) {
  const db = database();
  const accessibleReservation = await accessQuery(
    db('reservations').join('villas', 'villas.id', 'reservations.villa_id').select('reservations.id').where('reservations.id', reservationId),
    user
  ).first();
  if (!accessibleReservation) throw new ApiError(404, 'Reservation not found');
  await db('reservations').where({ id: reservationId }).update(input);
  if (input.booking_status === 'confirmed') {
    const reservation = await db('reservations').where({ id: reservationId }).first();
    await db('reservation_emails').insert({ reservation_id: reservationId, recipient: reservation.guest_email, template: 'reservation-confirmed', status: 'sent' });
  }
}

export async function createPublicReservation(input) {
  const db = database();
  return db.transaction(async (trx) => {
    const typeBooking = Boolean(input.villaTypeId);
    const villa = typeBooking
      ? await trx('villas').join('villa_types', 'villa_types.id', 'villas.villa_type_id').where({ 'villas.villa_type_id': input.villaTypeId, 'villas.status': 'active', 'villas.availability_status': 'available', 'villa_types.is_active': true, 'villa_types.status': 'active', 'villa_types.availability_status': 'available' }).select('villas.*').orderBy('villas.id').first()
      : await trx('villas').where({ id: input.villaId, status: 'active', availability_status: 'available' }).first();
    if (!villa) throw new ApiError(404, 'This villa selection is not available for booking');
    if (input.bookingKind === 'overnight' && villa.villa_type_id) {
      const type = await trx('villa_types').where({ id: villa.villa_type_id }).first();
      if (type?.day_tour_only) throw new ApiError(400, 'This Villa Type is available for Day Tours only');
    }
    if (input.guests > villa.capacity) throw new ApiError(400, `This villa accommodates up to ${villa.capacity} guests`);
    const conflictQuery = trx('reservations').whereIn('booking_status', ['pending', 'confirmed', 'checked_in']).where('check_in', '<', input.checkOut).where('check_out', '>', input.checkIn);
    if (typeBooking) {
      const [{ count: availableRooms }] = await trx('villas').join('villa_types', 'villa_types.id', 'villas.villa_type_id').where({ 'villas.villa_type_id': input.villaTypeId, 'villas.status': 'active', 'villas.availability_status': 'available', 'villa_types.is_active': true, 'villa_types.status': 'active', 'villa_types.availability_status': 'available' }).count({ count: '*' });
      const [{ count: bookedRooms }] = await conflictQuery.where({ villa_type_id: input.villaTypeId }).count({ count: '*' });
      if (Number(bookedRooms) >= Number(availableRooms)) throw new ApiError(409, 'Those dates are no longer available');
    } else if (await conflictQuery.where({ villa_id: input.villaId }).first()) {
      throw new ApiError(409, 'Those dates are no longer available');
    }
    const referenceNumber = `BRS-${Date.now().toString(36).toUpperCase()}`;
    const assignedVillaId = typeBooking && input.operatingMode !== 'hotel' ? villa.id : input.operatingMode === 'hotel' ? null : input.villaId;
    const [id] = await trx('reservations').insert({ villa_id: assignedVillaId, villa_type_id: typeBooking ? input.villaTypeId : null, booking_kind: input.bookingKind, payment_method: input.paymentMethod, payment_status: input.paymentMethod === 'cash' ? 'pending' : 'paid', total_amount: input.totalAmount, reference_number: referenceNumber, guest_user_id: input.guestUserId || null, guest_name: input.guestName, guest_email: input.guestEmail, check_in: input.checkIn, check_out: input.bookingKind === 'day_tour' ? input.checkIn : input.checkOut, status: 'pending', booking_status: 'pending' });
    if (input.serviceIds?.length) {
      const selectedServices = await trx('services').whereIn('id', input.serviceIds).where('is_active', true);
      await trx('reservation_services').insert(selectedServices.map((service) => ({ reservation_id: id, service_id: service.id, unit_price: service.price, quantity: 1 })));
    }
    await trx('reservation_emails').insert({ reservation_id: id, recipient: input.guestEmail, template: 'reservation-received', status: 'sent' });
    return { id: String(id), referenceNumber, villaId: assignedVillaId ? String(assignedVillaId) : null, villaTypeId: typeBooking ? String(input.villaTypeId) : null, guestName: input.guestName, guestEmail: input.guestEmail, checkIn: input.checkIn, checkOut: input.checkOut, bookingStatus: 'pending', paymentStatus: input.paymentMethod === 'cash' ? 'pending' : 'paid', totalAmount: input.totalAmount };
  });
}

export async function assignReservationVilla(reservationId, villaId) {
  const db = database();
  const reservation = await db('reservations').where({ id: reservationId }).first();
  const villa = await db('villas').where({ id: villaId, status: 'active' }).first();
  if (!reservation || !villa) throw new ApiError(404, 'Reservation or villa not found');
  if (reservation.villa_type_id && String(reservation.villa_type_id) !== String(villa.villa_type_id)) {
    throw new ApiError(400, 'The assigned villa must belong to the booked Villa Type');
  }
  await db('reservations').where({ id: reservationId }).update({ villa_id: villaId });
}
