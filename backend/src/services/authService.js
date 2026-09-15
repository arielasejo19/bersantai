import bcrypt from 'bcryptjs';
import { createUserWithProfile, findUserByEmail, findUserWithProfileById, updateLastLogin } from '../repositories/userRepository.js';
import { ApiError } from '../utils/apiError.js';
import { createAuthToken } from './tokenService.js';

const passwordHashRounds = 12;

function formatAuthResponse(user, token) {
  return {
    user,
    token
  };
}

export async function registerUser(input) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, passwordHashRounds);
  const user = await createUserWithProfile({
    email: input.email,
    passwordHash,
    displayName: input.displayName
  });
  const token = createAuthToken(user);

  return formatAuthResponse(user, token);
}

export async function loginUser(input) {
  const userRecord = await findUserByEmail(input.email);
  const validPassword = userRecord ? await bcrypt.compare(input.password, userRecord.password_hash) : false;

  if (!userRecord || !validPassword) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (userRecord.account_status && userRecord.account_status !== 'active') {
    throw new ApiError(403, 'This account is not active');
  }

  await updateLastLogin(userRecord.id);
  const user = await findUserWithProfileById(userRecord.id);
  const token = createAuthToken(user);

  return formatAuthResponse(user, token);
}

export function getCurrentUser(user) {
  return {
    user
  };
}
