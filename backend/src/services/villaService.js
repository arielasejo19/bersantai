import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { createManagedUser, listAccounts } from '../repositories/userRepository.js';
import { addAmenity, addPhoto, archiveVilla, assignReceptionist, assignReservationVilla, checkPublicAvailability, checkPublicAvailabilityCalendar, createPublicReservation, createVilla, findPublicVilla, findVillaForUser, listCalendarVillas, listGuestReservations, listPublicVillas, listReservationsForRole, listReservationsForUser, listVillasForUser, updateReservation, updateReservationEmailStatus, updateVilla, updateVillaMapPosition } from '../repositories/villaRepository.js';
import { ApiError } from '../utils/apiError.js';
import { getOperatingMode } from '../repositories/settingsRepository.js';
import { requireVerifiedBookingEmail } from './bookingVerificationService.js';
import { sendBookingConfirmationEmail } from './emailService.js';
import { storeMedia } from './mediaStorageService.js';
import { calculateVillaStayRates } from '../repositories/pricingRepository.js';

const rounds = 12;

export const getVillas = (user) => listVillasForUser(user);
export const getCalendarVillas = (user) => listCalendarVillas(user);
export const getPublicVillas = () => listPublicVillas();
export const getPublicVilla = (id) => findPublicVilla(id);
export const archiveManagedVilla = (id, user) => archiveVilla(id, user);
export const setVillaMapPosition = (id, input, user) => updateVillaMapPosition(id, input, user);
export const getPublicAvailability = (input) => checkPublicAvailability(input);
export const getPublicAvailabilityCalendar = (input) => checkPublicAvailabilityCalendar(input);
export async function getPricingEstimate(input) {
  const db = (await import('../config/database.js')).getDatabase();
  if (!db) throw new ApiError(503, 'Database is not configured');
  let villa;
  if (input.villaTypeId) {
    const candidates = await db('villas').join('villa_types', 'villa_types.id', 'villas.villa_type_id').where({ 'villas.villa_type_id': input.villaTypeId }).select('villas.id', 'villas.villa_type_id', 'villas.nightly_price').orderBy('villas.id');
    let matchingCandidate;
    for (const candidate of candidates) {
      const matchingRule = await db('villa_pricing_rules').where({ is_active: true }).where((query) => query.where({ villa_id: candidate.id }).orWhere({ villa_type_id: candidate.villa_type_id })).whereIn('stay_type', [input.bookingKind, 'both']).first();
      if (matchingRule) { matchingCandidate = candidate; break; }
    }
    villa = matchingCandidate || candidates[0];
  } else {
    villa = await db('villas').where({ id: input.villaId }).select('id', 'villa_type_id', 'nightly_price').first();
  }
  if (!villa) throw new ApiError(404, 'Villa not found');
  const dailyRates = await calculateVillaStayRates(db, villa.id, input.checkIn, input.bookingKind === 'day_tour' ? input.checkIn : input.checkOut, villa.nightly_price, input.bookingKind);
  return { nightlyPrice: Number(villa.nightly_price || 0), stayTotal: dailyRates.reduce((total, rate) => total + rate.price, 0), dailyRates };
}
export async function bookVilla(input, user) {
  if (!user?.emailVerified) await requireVerifiedBookingEmail(input.guestEmail, input.verificationToken);
  const reservation = await createPublicReservation({ ...input, guestUserId: user?.id || null, operatingMode: await getOperatingMode() });
  try {
    await sendBookingConfirmationEmail(reservation);
    reservation.confirmationEmailSent = true;
    try { await updateReservationEmailStatus(reservation.id, 'sent'); } catch { }
  } catch (_error) {
    try { await updateReservationEmailStatus(reservation.id, 'failed'); } catch { }
    reservation.confirmationEmailSent = false;
  }
  return reservation;
}
export const getVilla = (id, user) => findVillaForUser(id, user);

export async function createManagedVilla(input) {
  const id = await createVilla(input);
  return { id: String(id) };
}

export async function editVilla(id, input, user) {
  const villa = await findVillaForUser(id, user);
  if (user.role === 'host' && input.ownerUserId && String(input.ownerUserId) !== user.id) {
    throw new ApiError(403, 'Hosts cannot transfer villa ownership');
  }
  await updateVilla(id, { ...input, ownerUserId: user.role === 'host' ? user.id : input.ownerUserId ?? villa.owner?.id ?? null });
  return findVillaForUser(id, user);
}

export async function addVillaAmenity(id, name, user) {
  await findVillaForUser(id, user);
  await addAmenity(id, name);
  return findVillaForUser(id, user);
}

export async function addVillaPhoto(id, input, user) {
  await findVillaForUser(id, user);
  await addPhoto(id, input);
  return findVillaForUser(id, user);
}

export async function assignVillaReceptionist(id, userId, user) {
  if (user.role !== 'admin') throw new ApiError(403, 'Only admins can assign receptionists');
  await findVillaForUser(id, user);
  await assignReceptionist(id, userId);
}

export const getVillaReservations = (id, user) => listReservationsForUser(id, user);
export const getGuestBookingReservations = (user) => listGuestReservations(user);
export const getReservations = (user) => listReservationsForRole(user);

export async function changeReservationStatus(id, status, user) {
  if (!['admin', 'host', 'receptionist'].includes(user.role)) throw new ApiError(403, 'You do not have permission to update reservations');
  await updateReservation(id, { booking_status: status }, user);
}

export async function inviteStaff(input) {
  const password = input.password || `${randomUUID().slice(0, 8)}A!`;
  const user = await createManagedUser({ email: input.email, displayName: input.displayName, role: input.role, passwordHash: await bcrypt.hash(password, rounds) });
  return { user, temporaryPassword: input.password ? undefined : password };
}

export async function getAccounts(role) {
  return listAccounts({ role });
}

export async function assignReservation(id, villaId, user) {
  if (!['admin', 'receptionist'].includes(user.role)) throw new ApiError(403, 'Only Reception can assign a villa at check-in');
  await assignReservationVilla(id, villaId);
}

export async function uploadVillaMedia(id, files, user) {
  const villa = await findVillaForUser(id, user);
  const uploaded = await Promise.all(files.map(storeMedia));
  for (const [index, media] of uploaded.entries()) await addPhoto(id, { ...media, altText: '', sortOrder: villa.photos.length + index, isThumbnail: !villa.photos.length && index === 0 });
  return findVillaForUser(id, user);
}
