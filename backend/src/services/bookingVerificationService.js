import { createChallenge, isVerifiedChallenge, verifyChallenge } from '../repositories/bookingVerificationRepository.js';
import { ApiError } from '../utils/apiError.js';
import { sendBookingVerificationEmail } from './emailService.js';

export async function sendBookingVerification(email) {
  const challenge = await createChallenge(email);
  await sendBookingVerificationEmail(email, challenge.code);
  return { challengeId: challenge.challengeId, expiresInSeconds: 600, devCode: process.env.NODE_ENV === 'development' ? challenge.code : undefined };
}

export async function verifyBookingEmail(email, challengeId, code) {
  return verifyChallenge(email, challengeId, code);
}

export async function requireVerifiedBookingEmail(email, token) {
  if (!token || !(await isVerifiedChallenge(email, token))) throw new ApiError(403, 'Verify your email before payment');
}
