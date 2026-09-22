import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { createUserWithProfile, findUserByEmail, findUserWithProfileById } from '../repositories/userRepository.js';
import { getDatabase } from '../config/database.js';
import { createAuthToken } from './tokenService.js';
import { ApiError } from '../utils/apiError.js';

async function createSocialSession(input) {
  if (!['google', 'facebook'].includes(input.provider)) throw new ApiError(400, 'Unsupported social provider');
  const db = getDatabase();
  const identity = await db('social_identities').where({ provider: input.provider, provider_user_id: input.providerUserId }).first();
  let user = identity ? await findUserWithProfileById(identity.user_id) : await findUserByEmail(input.email);
  if (!user) {
    user = await createUserWithProfile({ email: input.email, passwordHash: await bcrypt.hash(crypto.randomUUID(), 12), displayName: input.displayName });
  } else if (user.password_hash) {
    user = await findUserWithProfileById(user.id);
  }
  const userId = user.id;
  await db('social_identities').insert({ user_id: userId, provider: input.provider, provider_user_id: input.providerUserId, email: input.email }).onConflict(['provider', 'provider_user_id']).merge({ user_id: userId, email: input.email });
  return { user: await findUserWithProfileById(userId), token: createAuthToken(await findUserWithProfileById(userId)) };
}

export async function socialLogin(input) {
  if (!env.socialAuthDevMode) throw new ApiError(501, 'Social login providers are not configured');
  return createSocialSession(input);
}

export async function socialLoginWithSupabase(accessToken) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) throw new ApiError(501, 'Supabase social login is not configured');
  const response = await fetch(`${env.supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
    headers: { apikey: env.supabaseAnonKey, Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new ApiError(401, 'The social login session is invalid or expired');
  const identity = await response.json();
  const provider = identity.app_metadata?.provider;
  const email = identity.email;
  if (!identity.id || !email || !['google', 'facebook'].includes(provider)) throw new ApiError(400, 'Unsupported social login identity');
  const metadata = identity.user_metadata || {};
  return createSocialSession({ provider, providerUserId: identity.id, email, displayName: metadata.full_name || metadata.name || email.split('@')[0] });
}
