import { env } from '../config/env.js';

export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode || 500;
  const payload = {
    message: statusCode === 500 ? 'Internal server error' : error.message
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (env.nodeEnv !== 'production') {
    payload.stack = error.stack;
  }

  response.status(statusCode).json(payload);
}
