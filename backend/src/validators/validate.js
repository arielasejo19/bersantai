import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError.js';

export function validateBody(schema, body) {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }));

      throw new ApiError(400, 'Validation failed', details);
    }

    throw error;
  }
}
