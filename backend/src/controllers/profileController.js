import { getOwnProfile, updateOwnProfile } from '../services/profileService.js';
import { getGuestBookingReservations } from '../services/villaService.js';
import { updateProfileSchema } from '../validators/profileValidators.js';
import { validateBody } from '../validators/validate.js';

export async function getProfile(request, response) {
  const result = await getOwnProfile(request.user.id);

  response.status(200).json(result);
}

export async function updateProfile(request, response) {
  const input = validateBody(updateProfileSchema, request.body);
  const result = await updateOwnProfile(request.user.id, input);

  response.status(200).json(result);
}

export async function getGuestBookings(request, response) {
  response.status(200).json({ reservations: await getGuestBookingReservations(request.user) });
}
