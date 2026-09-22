import { z } from 'zod';
import { socialLogin } from '../services/socialAuthService.js';
import { setAuthCookie } from '../utils/authCookie.js';
import { validateBody } from '../validators/validate.js';

const schema = z.object({ provider: z.enum(['google', 'facebook']), providerUserId: z.string().min(2).max(255), email: z.string().email().max(255).transform((value) => value.toLowerCase()), displayName: z.string().trim().min(2).max(150) });
export async function social(request, response) { const result = await socialLogin(validateBody(schema, request.body)); setAuthCookie(response, result.token); response.json({ user: result.user }); }
