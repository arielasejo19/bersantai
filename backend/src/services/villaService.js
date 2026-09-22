import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { createManagedUser, listAccounts } from '../repositories/userRepository.js';
import { addAmenity, addPhoto, assignReceptionist, assignReservationVilla, checkPublicAvailability, createPublicReservation, createVilla, findPublicVilla, findVillaForUser, listPublicVillas, listReservationsForRole, listReservationsForUser, listVillasForUser, updateReservation, updateVilla } from '../repositories/villaRepository.js';
import { ApiError } from '../utils/apiError.js';
import { getOperatingMode } from '../repositories/settingsRepository.js';
import { requireVerifiedBookingEmail } from './bookingVerificationService.js';
import { storeMedia } from './mediaStorageService.js';

const rounds = 12;

export const getVillas = (user) => listVillasForUser(user);
export const getPublicVillas = () => listPublicVillas();
export const getPublicVilla = (id) => findPublicVilla(id);
export const getPublicAvailability = (input) => checkPublicAvailability(input);
export async function bookVilla(input, user) {
  if (!user?.emailVerified) await requireVerifiedBookingEmail(input.guestEmail, input.verificationToken);
  return createPublicReservation({ ...input, operatingMode: await getOperatingMode() });
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