import { z } from 'zod';

export const villaTypeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(5000).optional().nullable(),
  isActive: z.boolean().default(true),
  dayTourOnly: z.boolean().default(false),
  defaultImageUrl: z.string().url().max(1000).optional().nullable()
});
