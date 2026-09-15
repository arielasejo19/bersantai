import { z } from 'zod';

const optionalTrimmedString = (maxLength) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .nullable()
    .transform((value) => (value === '' ? null : value));

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters').max(150),
  bio: optionalTrimmedString(1000),
  avatarUrl: optionalTrimmedString(500).refine(
    (value) => !value || /^https?:\/\/\S+$/i.test(value),
    'Avatar URL must be a valid HTTP or HTTPS URL'
  )
});
