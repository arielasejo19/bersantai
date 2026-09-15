import { findProfileByUserId, updateProfileByUserId } from '../repositories/profileRepository.js';
import { ApiError } from '../utils/apiError.js';

export async function getOwnProfile(userId) {
  const profile = await findProfileByUserId(userId);

  if (!profile) {
    throw new ApiError(404, 'Profile not found');
  }

  return {
    profile
  };
}

export async function updateOwnProfile(userId, input) {
  const profile = await updateProfileByUserId(userId, input);

  return {
    profile
  };
}
