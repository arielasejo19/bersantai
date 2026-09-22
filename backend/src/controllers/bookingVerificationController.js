import { sendBookingVerification, verifyBookingEmail } from '../services/bookingVerificationService.js';
import { z } from 'zod';
import { validateBody } from '../validators/validate.js';

const emailSchema = z.object({ email: z.string().email().max(255).transform((value) => value.toLowerCase()) });
const verifySchema = emailSchema.extend({ challengeId: z.string().uuid(), code: z.string().regex(/^\d{6}$/) });

export async function sendVerification(request, response) { response.json(await sendBookingVerification(validateBody(emailSchema, request.body).email)); }
export async function verifyVerification(request, response) { response.json(await verifyBookingEmail(validateBody(verifySchema, request.body).email, request.body.challengeId, request.body.code)); }
