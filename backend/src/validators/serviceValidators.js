import { z } from 'zod';
const mediaUrl = z.string().max(1000).refine((value) => /^https?:\/\/\S+$/i.test(value) || value.startsWith('/uploads/'), 'Media URL must be an HTTP URL or uploaded media path');

export const serviceSchema = z.object({
  title: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(2).max(5000),
  price: z.coerce.number().min(0).default(0),
  category: z.string().trim().min(2).max(80).default('service'),
  imageUrl: mediaUrl.optional().nullable(),
  isActive: z.boolean().default(true),
  dayTourOnly: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0)
});
