import { z } from 'zod';
import { socialLogin, socialLoginWithSupabase } from '../services/socialAuthService.js';
import { setAuthCookie } from '../utils/authCookie.js';
import { validateBody } from '../validators/validate.js';

const schema = z.object({ provider: z.enum(['google', 'facebook']), providerUserId: z.string().min(2).max(255), email: z.string().email().max(255).transform((value) => value.toLowerCase()), displayName: z.string().trim().min(2).max(150) });
const exchangeSchema = z.object({ accessToken: z.string().min(20).max(10000) });
export async function social(request, response) { const result = await socialLogin(validateBody(schema, request.body)); setAuthCookie(response, result.token); response.json({ user: result.user }); }
export async function exchange(request, response) { const result = await socialLoginWithSupabase(validateBody(exchangeSchema, request.body).accessToken); setAuthCookie(response, result.token); response.json({ user: result.user }); }
