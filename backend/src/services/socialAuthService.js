import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { createUserWithProfile, findUserByEmail, findUserWithProfileById } from '../repositories/userRepository.js';
import { getDatabase } from '../config/database.js';
import { createAuthToken } from './tokenService.js';
import { ApiError } from '../utils/apiError.js';

export async function socialLogin(input) {
  if (!env.socialAuthDevMode) throw new ApiError(501, 'Social login providers are not configured');
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
