import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';
import { calculateVillaStayTotal } from './pricingRepository.js';
import { availableInventoryCount, availableInventoryVillaIds, getVillaTypeAvailability, listAvailableUnitsByDate, reservationDatesOverlap } from './reservationRepository.js';

export function isSingleVillaTypeBooking(typeLike, unitCount = 0) {
  const typeName = String(typeLike?.slug || typeLike?.name || typeLike || '').trim().toLowerCase();
  const totalUnits = Number(unitCount || 0);
  return Boolean(typeName === 'dining-pavilion' || typeName.includes('dining pavilion') || totalUnits <= 1);
}

export function resolveAssignedVillaId(input, fallbackVilla = null) {
  if (input?.villaId) return Number(input.villaId);
  if (input?.operatingMode === 'hotel') return null;
  if (fallbackVilla?.id) return Number(fallbackVilla.id);
  return null;
}

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
    bedroomCount: row.bedroom_count, status: row.status, availabilityStatus: row.availability_status, occupancyStatus: row.occupancy_status || 'available', stayType: row.stay_type || 'both', mapX: row.map_x === null || row.map_x === undefined ? null : Number(row.map_x), mapY: row.map_y === null || row.map_y === undefined ? null : Number(row.map_y), standardCheckIn: row.standard_check_in || '15:00', standardCheckOut: row.standard_check_out || '11:00',
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

async function publicPricingRules(db, villaId, villaTypeId) {
  const rules = await db('villa_pricing_rules').where({ is_active: true }).where((query) => query.where({ villa_id: villaId }).orWhere({ villa_type_id: villaTypeId || 0 })).orderBy('rule_type').select('id', 'name', 'stay_type', 'rule_type', 'starts_on', 'ends_on', 'price');
  return rules.map((rule) => ({ id: String(rule.id), name: rule.name, stayType: rule.stay_type || 'both', ruleType: rule.rule_type, startsOn: rule.starts_on, endsOn: rule.ends_on, price: Number(rule.price || 0) }));
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
    const pricingRules = await publicPricingRules(db, row.id, row.villa_type_id);
    return { ...toVilla(row, items.amenities, items.photos), pricingRules };
  }));
}

export async function listCalendarVillas(user) {
  return listVillasForUser(user.role === 'receptionist' ? { ...user, role: 'admin' } : user);
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
    const pricingRules = await publicPricingRules(db, row.id, row.villa_type_id);
    return { ...toVilla(row, items.amenities, items.photos), pricingRules };
  }));
}

export async function findPublicVilla(villaId) {
  const db = database();
  const row = await baseQuery(db).where('villas.id', villaId).where('villas.status', 'active').where('villas.availability_status', 'available').where((builder) => builder.whereNull('villa_types.id').orWhere('villa_types.is_active', true).andWhere('villa_types.status', 'active').andWhere('villa_types.availability_status', 'available')).first();
  if (!row) throw new ApiError(404, 'Villa not found');
  const items = await related(db, row.id);
  const pricingRules = await publicPricingRules(db, row.id, row.villa_type_id);
  return { ...toVilla(row, items.amenities, items.photos), pricingRules };
}

export async function listGuestReservations(user) {
  const db = database();
  const rows = await db('reservations')
    .leftJoin('villas', 'villas.id', 'reservations.villa_id')
    .leftJoin('villa_types', 'villa_types.id', 'reservations.villa_type_id')
    .where((query) => query.where('reservations.guest_user_id', user.id).orWhere('reservations.guest_email', user.email))
    .select('reservations.*', 'villas.name as villa_name', 'villa_types.name as villa_type_name')
    .orderBy('reservations.check_in', 'desc');
  return rows.map((row) => ({
    id: String(row.id), referenceNumber: row.reference_number, villaId: row.villa_id ? String(row.villa_id) : null,
    villaName: row.villa_name || row.villa_type_name || 'Bersantai stay', bookingKind: row.booking_kind,
    guestName: row.guest_name, guestEmail: row.guest_email, checkIn: row.check_in, checkOut: row.check_out,
    bookingStatus: row.booking_status, bookingMode: row.booking_mode || (row.villa_id ? 'airbnb' : 'hotel'), paymentStatus: row.payment_status, paymentMethod: row.payment_method, guests: Number(row.guests || 1),
    totalAmount: Number(row.total_amount || 0), guestNote: row.guest_note || ''
  }));
}

export async function checkPublicAvailability(input) {
  const db = database();
  const checkOut = input.checkOut || input.checkIn;
  if (input.villaTypeId) {
    const inventory = await getVillaTypeAvailability(input.villaTypeId, input.checkIn, checkOut, input.bookingKind || 'overnight');
    return { available: inventory.availableUnits > 0, availableUnits: inventory.availableUnits, totalUnits: inventory.units.length };
  }
  const villa = await db('villas').leftJoin('villa_types', 'villa_types.id', 'villas.villa_type_id')
    .where({ 'villas.id': input.villaId, 'villas.status': 'active', 'villas.availability_status': 'available' })
    .where((query) => query.whereNull('villa_types.id').orWhere((builder) => builder.where({ 'villa_types.is_active': true, 'villa_types.status': 'active', 'villa_types.availability_status': 'available' })))
    .first('villas.id', 'villas.villa_type_id');
  if (!villa) return { available: false, availableUnits: 0, totalUnits: 0 };
  if (villa.villa_type_id) {
    const inventory = await getVillaTypeAvailability(villa.villa_type_id, input.checkIn, checkOut, input.bookingKind || 'overnight');
    const eligibleVillaIds = availableInventoryVillaIds(inventory.units, inventory.reservations, input.checkIn, checkOut, input.bookingKind || 'overnight');
    const available = eligibleVillaIds.includes(String(input.villaId));
    return { available, availableUnits: available ? 1 : 0, totalUnits: 1 };
  }
  const reservations = await db('reservations').where({ villa_id: input.villaId }).whereIn('booking_status', ['pending', 'confirmed', 'checked_in']).select('id', 'villa_id', 'booking_status', 'booking_kind', 'check_in', 'check_out');
  const conflict = reservations.some((reservation) => reservationDatesOverlap(reservation, input.checkIn, checkOut, input.bookingKind || 'overnight'));
  return { available: !conflict, availableUnits: conflict ? 0 : 1, totalUnits: 1 };
}

export async function checkPublicAvailabilityCalendar(input) {
  return listAvailableUnitsByDate(input);
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
      status: input.status, availability_status: input.availabilityStatus, standard_check_in: input.standardCheckIn, standard_check_out: input.standardCheckOut, owner_user_id: input.ownerUserId, villa_type_id: input.villaTypeId || null
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
      status: input.status, availability_status: input.availabilityStatus, standard_check_in: input.standardCheckIn, standard_check_out: input.standardCheckOut, owner_user_id: input.ownerUserId, villa_type_id: input.villaTypeId || null
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

export async function updateVillaMapPosition(villaId, input, user) {
  const db = database();
  const query = db('villas').where({ id: villaId });
  if (user.role === 'host') query.where({ owner_user_id: user.id });
  if (!(await query.first())) throw new ApiError(404, 'Villa not found');
  await db('villas').where({ id: villaId }).update({ map_x: input.mapX, map_y: input.mapY });
}

export async function archiveVilla(villaId, user) {
  const db = database();
  const query = db('villas').where({ id: villaId });
  if (user.role === 'host') query.where({ owner_user_id: user.id });
  const updated = await query.update({ status: 'inactive' });
  if (!updated) throw new ApiError(404, 'Villa not found');
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
    .select('reservations.*', 'villas.name as villa_name', 'villas.occupancy_status as villa_occupancy_status', 'villa_types.name as villa_type_name')
    .orderBy('reservations.check_in');
  if (user.role === 'host') query = query.where('villas.owner_user_id', user.id);
  return (await query).map((row) => ({ ...row, id: String(row.id), villa_id: row.villa_id ? String(row.villa_id) : null, villa_type_id: row.villa_type_id ? String(row.villa_type_id) : null, booking_mode: row.booking_mode || (row.villa_id ? 'airbnb' : 'hotel'), guests: Number(row.guests || 1), total_amount: Number(row.total_amount || 0) }));
}

export function summarizeReservationRevenue(reservation, serviceTotal = 0, foodTotal = 0, collectedRevenue = 0) {
  const grossRevenue = Number(reservation?.total_amount || 0);
  const excludedAddOns = Number(serviceTotal || 0) + Number(foodTotal || 0);
  const netHostRevenue = Math.max(0, grossRevenue - excludedAddOns);
  const collectedAmount = Number(collectedRevenue || 0);
  const outstandingBalance = Math.max(0, netHostRevenue - collectedAmount);

  return {
    id: reservation?.id || null,
    guestName: reservation?.guest_name || reservation?.guestName || 'Guest',
    referenceNumber: reservation?.reference_number || reservation?.referenceNumber || reservation?.id || 'N/A',
    bookingStatus: reservation?.booking_status || reservation?.bookingStatus || 'pending',
    paymentStatus: reservation?.payment_status || reservation?.paymentStatus || 'unpaid',
    checkIn: reservation?.check_in || reservation?.checkIn || null,
    checkOut: reservation?.check_out || reservation?.checkOut || null,
    totalAmount: grossRevenue,
    grossRevenue,
    netHostRevenue,
    collectedRevenue: collectedAmount,
    outstandingBalance,
    villaName: reservation?.villa_name || reservation?.villaName || reservation?.villa_type_name || 'Bersantai stay'
  };
}

export async function listHostRevenueSummary(user) {
  const db = database();
  const query = db('reservations')
    .leftJoin('villas', 'villas.id', 'reservations.villa_id')
    .leftJoin('villa_types', 'villa_types.id', 'reservations.villa_type_id')
    .select('reservations.*', 'villas.name as villa_name', 'villas.owner_user_id', 'villa_types.name as villa_type_name');
  const scoped = user.role === 'host' ? query.where('villas.owner_user_id', user.id) : query;
  const reservations = await scoped.orderBy('reservations.check_in', 'desc');
  if (!reservations.length) {
    return { grossRevenue: 0, netHostRevenue: 0, collectedRevenue: 0, outstandingBalance: 0, totalBookings: 0, byVilla: [] };
  }
  const reservationIds = reservations.map((reservation) => reservation.id);
  const [serviceRows, foodRows, paymentRows] = await Promise.all([
    db('reservation_services').whereIn('reservation_id', reservationIds).select('reservation_id', 'unit_price', 'quantity'),
    db('reservation_charges').whereIn('reservation_id', reservationIds).where('item_type', 'prebooked_food').select('reservation_id', 'total_amount'),
    db('reservation_payments').whereIn('reservation_id', reservationIds).where({ status: 'collected' }).select('reservation_id', 'amount')
  ]);
  const serviceTotals = new Map();
  const foodTotals = new Map();
  const paymentTotals = new Map();
  serviceRows.forEach((row) => {
    const total = Number(row.unit_price || 0) * Number(row.quantity || 0);
    serviceTotals.set(Number(row.reservation_id), (serviceTotals.get(Number(row.reservation_id)) || 0) + total);
  });
  foodRows.forEach((row) => {
    const total = Number(row.total_amount || 0);
    foodTotals.set(Number(row.reservation_id), (foodTotals.get(Number(row.reservation_id)) || 0) + total);
  });
  paymentRows.forEach((row) => {
    const total = Number(row.amount || 0);
    paymentTotals.set(Number(row.reservation_id), (paymentTotals.get(Number(row.reservation_id)) || 0) + total);
  });
  const reservationSummaries = reservations.map((reservation) => {
    const villaName = reservation.villa_name || reservation.villa_type_name || 'Bersantai stay';
    const serviceTotal = serviceTotals.get(Number(reservation.id)) || 0;
    const foodTotal = foodTotals.get(Number(reservation.id)) || 0;
    const collected = paymentTotals.get(Number(reservation.id)) || 0;
    return { ...summarizeReservationRevenue({ ...reservation, villa_name: villaName }, serviceTotal, foodTotal, collected), villaName };
  });
  const byVilla = new Map();
  reservationSummaries.forEach((reservation) => {
    const entry = byVilla.get(reservation.villaName) || {
      villaName: reservation.villaName,
      bookings: 0,
      grossRevenue: 0,
      netHostRevenue: 0,
      collectedRevenue: 0,
      outstandingBalance: 0,
      bookingDetails: []
    };

    entry.bookings += 1;
    entry.grossRevenue += reservation.grossRevenue;
    entry.netHostRevenue += reservation.netHostRevenue;
    entry.collectedRevenue += reservation.collectedRevenue;
    entry.outstandingBalance += reservation.outstandingBalance;
    entry.bookingDetails.push({ ...reservation, guestName: reservation.guestName, referenceNumber: reservation.referenceNumber });
    byVilla.set(reservation.villaName, entry);
  });
  const totalBookings = reservations.length;
  const grossRevenue = reservationSummaries.reduce((sum, reservation) => sum + Number(reservation.grossRevenue || 0), 0);
  const netHostRevenue = reservationSummaries.reduce((sum, reservation) => sum + Number(reservation.netHostRevenue || 0), 0);
  const collectedRevenue = paymentRows.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const outstandingBalance = reservationSummaries.reduce((sum, reservation) => sum + Number(reservation.outstandingBalance || 0), 0);
  return {
    grossRevenue,
    netHostRevenue,
    collectedRevenue,
    outstandingBalance,
    totalBookings,
    byVilla: Array.from(byVilla.values()).sort((left, right) => right.netHostRevenue - left.netHostRevenue)
  };
}

export async function createPublicReservation(input) {
  const db = database();
  return db.transaction(async (trx) => {
    const hotelMode = input.operatingMode === 'hotel';
    const selectedSingleVillaType = async () => {
      const selectedVillaId = input.villaId ? Number(input.villaId) : null;
      const selectedTypeId = input.villaTypeId ? Number(input.villaTypeId) : null;
      const candidates = [];
      if (selectedVillaId) {
        const villa = await trx('villas').where({ id: selectedVillaId }).select('id', 'villa_type_id', 'name', 'slug').first();
        if (villa?.villa_type_id) {
          const type = await trx('villa_types').where({ id: villa.villa_type_id }).select('id', 'name', 'slug').first();
          const typeUnitCount = await trx('villas').where({ villa_type_id: villa.villa_type_id, status: 'active' }).count({ count: 'id' }).first();
          candidates.push({ villa, type, unitCount: Number(typeUnitCount?.count || 0) });
        }
      }
      if (selectedTypeId) {
        const type = await trx('villa_types').where({ id: selectedTypeId }).select('id', 'name', 'slug').first();
        const typeUnitCount = await trx('villas').where({ villa_type_id: selectedTypeId, status: 'active' }).count({ count: 'id' }).first();
        candidates.push({ type, unitCount: Number(typeUnitCount?.count || 0) });
      }
      const normalized = candidates.find(({ type, unitCount }) => type && isSingleVillaTypeBooking(type, unitCount));
      return normalized || null;
    };
    const uniqueVillaBooking = hotelMode ? await selectedSingleVillaType() : null;
    if (hotelMode && !uniqueVillaBooking && (!input.villaTypeId || input.villaId)) throw new ApiError(400, 'Hotel Mode bookings must select a villa type, not an individual villa');
    if (hotelMode && uniqueVillaBooking && !input.villaTypeId && !input.villaId) throw new ApiError(400, 'This unique villa booking requires a villa or villa type selection');
    if (!hotelMode && (!input.villaId || input.villaTypeId)) throw new ApiError(400, 'Airbnb Mode bookings must select a specific villa');

    let villa;
    let villaType;
    if (hotelMode) {
      if (uniqueVillaBooking && input.villaId) {
        villa = await trx('villas').where({ id: input.villaId, status: 'active', availability_status: 'available' }).forUpdate().first();
        if (!villa) throw new ApiError(404, 'This villa selection is not available for booking');
        villaType = villa.villa_type_id ? await trx('villa_types').where({ id: villa.villa_type_id }).first() : null;
        if (!villaType || !villaType.is_active || villaType.status !== 'active' || villaType.availability_status !== 'available') throw new ApiError(404, 'This villa selection is not available for booking');
        const endDate = input.bookingKind === 'day_tour' ? input.checkIn : input.checkOut;
        const overlapping = await trx('reservations').where({ villa_id: villa.id }).whereIn('booking_status', ['pending', 'confirmed', 'checked_in']).select('id', 'villa_id', 'booking_status', 'booking_kind', 'check_in', 'check_out');
        if (overlapping.some((reservation) => reservationDatesOverlap(reservation, input.checkIn, endDate, input.bookingKind))) throw new ApiError(409, 'Those dates are no longer available');
      } else {
        villaType = await trx('villa_types').where({ id: input.villaTypeId, is_active: true, status: 'active', availability_status: 'available' }).forUpdate().first();
        if (!villaType) throw new ApiError(404, 'This villa type is not available for booking');
        const typeVillas = await trx('villas').where({ villa_type_id: input.villaTypeId, status: 'active', availability_status: 'available' }).orderBy('id').forUpdate();
        if (!typeVillas.length) throw new ApiError(409, 'This villa type is sold out for the selected dates');
        const overlapping = await trx('reservations')
          .leftJoin('villas as reserved_villas', 'reserved_villas.id', 'reservations.villa_id')
          .whereIn('reservations.booking_status', ['pending', 'confirmed', 'checked_in'])
          .where((query) => query.where('reservations.villa_type_id', input.villaTypeId).orWhere('reserved_villas.villa_type_id', input.villaTypeId))
          .select('reservations.id', 'reservations.villa_id', 'reservations.booking_status', 'reservations.booking_kind', 'reservations.check_in', 'reservations.check_out');
        const availableUnits = availableInventoryCount(typeVillas, overlapping, input.checkIn, input.bookingKind === 'day_tour' ? input.checkIn : input.checkOut, input.bookingKind);
        if (availableUnits < 1) throw new ApiError(409, 'This villa type is sold out for the selected dates');
        villa = typeVillas[0];
      }
    } else {
      const selected = await trx('villas').where({ id: input.villaId }).select('villa_type_id').first();
      if (selected?.villa_type_id) await trx('villa_types').where({ id: selected.villa_type_id }).forUpdate().first();
      villa = await trx('villas').where({ id: input.villaId, status: 'active', availability_status: 'available' }).forUpdate().first();
      if (!villa) throw new ApiError(404, 'This villa selection is not available for booking');
      villaType = villa.villa_type_id ? await trx('villa_types').where({ id: villa.villa_type_id }).first() : null;
      if (villaType && (!villaType.is_active || villaType.status !== 'active' || villaType.availability_status !== 'available')) throw new ApiError(404, 'This villa selection is not available for booking');
      const endDate = input.bookingKind === 'day_tour' ? input.checkIn : input.checkOut;
      if (villa.villa_type_id) {
        const typeVillas = await trx('villas').where({ villa_type_id: villa.villa_type_id, status: 'active', availability_status: 'available' }).orderBy('id').forUpdate().select('id');
        const overlapping = await trx('reservations')
          .leftJoin('villas as reserved_villas', 'reserved_villas.id', 'reservations.villa_id')
          .whereIn('reservations.booking_status', ['pending', 'confirmed', 'checked_in'])
          .where((query) => query.where('reservations.villa_type_id', villa.villa_type_id).orWhere('reserved_villas.villa_type_id', villa.villa_type_id))
          .select('reservations.id', 'reservations.villa_id', 'reservations.booking_status', 'reservations.booking_kind', 'reservations.check_in', 'reservations.check_out');
        const candidateIds = availableInventoryVillaIds(typeVillas, overlapping, input.checkIn, endDate, input.bookingKind);
        if (!candidateIds.includes(String(villa.id))) throw new ApiError(409, 'Those dates are no longer available');
      } else {
        const overlapping = await trx('reservations').where({ villa_id: villa.id }).whereIn('booking_status', ['pending', 'confirmed', 'checked_in']).select('id', 'villa_id', 'booking_status', 'booking_kind', 'check_in', 'check_out');
        if (overlapping.some((reservation) => reservationDatesOverlap(reservation, input.checkIn, endDate, input.bookingKind))) throw new ApiError(409, 'Those dates are no longer available');
      }
    }

    const pricingBase = hotelMode ? Number(villaType.nightly_price || 0) : Number(villa.nightly_price || 0);
    const capacity = hotelMode ? Number(villaType.capacity || 1) : Number(villa.capacity || 1);
    if (input.bookingKind === 'overnight' && villaType?.day_tour_only) throw new ApiError(400, 'This Villa Type is available for Day Tours only');
    if (input.guests > capacity) throw new ApiError(400, `This villa accommodates up to ${capacity} guests`);
    const referenceNumber = `BRS-${Date.now().toString(36).toUpperCase()}`;
    const assignedVillaId = hotelMode ? resolveAssignedVillaId({ ...input, operatingMode: 'hotel' }, null) : resolveAssignedVillaId(input, villa);
    const selectedServices = input.serviceIds?.length ? await trx('services').whereIn('id', input.serviceIds).where('is_active', true) : [];
    const selectedMenuItems = input.menuItemIds?.length ? await trx('menu_items').whereIn('id', input.menuItemIds).where({ is_active: true, is_available: true }) : [];
    const stayTotal = await calculateVillaStayTotal(trx, villa.id, input.checkIn, input.bookingKind === 'day_tour' ? input.checkIn : input.checkOut, pricingBase, input.bookingKind);
    const serviceTotal = selectedServices.reduce((sum, service) => sum + Number(service.price || 0) * Number(input.serviceQuantities?.[service.id] || 1), 0);
    const menuTotal = selectedMenuItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(input.menuQuantities?.[item.id] || 1), 0);
    const serviceItems = selectedServices.map((service) => {
      const quantity = Number(input.serviceQuantities?.[service.id] || 1);
      return { name: service.title || service.name, quantity, totalAmount: Number(service.price || 0) * quantity };
    });
    const menuItems = selectedMenuItems.map((item) => {
      const quantity = Number(input.menuQuantities?.[item.id] || 1);
      return { name: item.name, quantity, totalAmount: Number(item.price || 0) * quantity };
    });
    const totalAmount = stayTotal + serviceTotal + menuTotal;
    const paymentPending = ['cash', 'pay_later'].includes(input.paymentMethod);
    const [id] = await trx('reservations').insert({ villa_id: assignedVillaId, villa_type_id: hotelMode ? (input.villaTypeId || villa.villa_type_id || null) : (villa.villa_type_id || null), booking_kind: input.bookingKind, booking_mode: hotelMode ? 'hotel' : 'airbnb', guests: input.guests, payment_method: input.paymentMethod, payment_status: paymentPending ? 'pending' : 'paid', total_amount: totalAmount, reference_number: referenceNumber, guest_user_id: input.guestUserId || null, guest_name: input.guestName, guest_email: input.guestEmail, guest_phone: input.guestPhone, guest_note: input.guestNote || null, check_in: input.checkIn, check_out: input.bookingKind === 'day_tour' ? input.checkIn : input.checkOut, status: 'pending', booking_status: 'pending' });
    if (selectedServices.length) await trx('reservation_services').insert(selectedServices.map((service) => ({ reservation_id: id, service_id: service.id, unit_price: service.price, quantity: Number(input.serviceQuantities?.[service.id] || 1) })));
    if (selectedMenuItems.length) await trx('reservation_charges').insert(selectedMenuItems.map((item) => { const quantity = Number(input.menuQuantities?.[item.id] || 1); return { reservation_id: id, item_type: 'prebooked_food', item_id: item.id, description: item.name, quantity, unit_price: item.price, total_amount: Number(item.price) * quantity }; }));
    if (!paymentPending && totalAmount > 0) await trx('reservation_payments').insert({ reservation_id: id, amount: totalAmount, payment_method: input.paymentMethod, reference: 'Initial booking payment', status: 'collected' });
    await trx('reservation_emails').insert({ reservation_id: id, recipient: input.guestEmail, template: 'reservation-received', status: 'pending', sent_at: null });
    await trx('reservation_activity').insert({ reservation_id: id, guest_user_id: input.guestUserId || null, villa_id: assignedVillaId, action: 'booking-requested' });
    return {
      id: String(id), referenceNumber, villaId: assignedVillaId ? String(assignedVillaId) : null,
      villaTypeId: villa.villa_type_id ? String(villa.villa_type_id) : null,
      villaName: villa.name,
      villaLocation: villa.location, guestName: input.guestName, guestEmail: input.guestEmail, guestPhone: input.guestPhone,
      guestNote: input.guestNote || '', bookingKind: input.bookingKind, bookingMode: hotelMode ? 'hotel' : 'airbnb', guests: input.guests,
      paymentMethod: input.paymentMethod, checkIn: input.checkIn,
      checkOut: input.bookingKind === 'day_tour' ? input.checkIn : input.checkOut,
      bookingStatus: 'pending', paymentStatus: paymentPending ? 'pending' : 'paid', totalAmount,
      serviceItems, menuItems
    };
  });
}

export async function updateReservationEmailStatus(reservationId, status, errorMessage = null) {
  const db = database();
  await db('reservation_emails')
    .where({ reservation_id: reservationId, template: 'reservation-received' })
    .update({ status, sent_at: status === 'sent' ? db.fn.now() : null, error_message: errorMessage });
}
