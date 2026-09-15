import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findUserWithProfileById } from '../repositories/userRepository.js';
import { ApiError } from '../utils/apiError.js';

function extractToken(request) {
  const authHeader = request.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }

  return request.cookies?.[env.authCookieName];
}

export async function requireAuth(request, _response, next) {
  try {
    const token = extractToken(request);

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await findUserWithProfileById(payload.sub);

    if (!user) {
      throw new ApiError(401, 'Authentication required');
    }

    request.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(new ApiError(401, 'Authentication required'));
  }
}
