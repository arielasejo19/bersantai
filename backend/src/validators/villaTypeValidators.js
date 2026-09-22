import { z } from 'zod';

export const villaTypeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(5000).optional().nullable(),
  isActive: z.boolean().default(true),
  dayTourOnly: z.boolean().default(false),
  defaultImageUrl: z.string().url().max(1000).optional().nullable(),
  galleryUrls: z.array(z.string().url().max(1000)).max(30).default([]),
  nightlyPrice: z.coerce.number().min(0).default(0),
  capacity: z.coerce.number().int().min(1).max(100).default(2),
  bedroomCount: z.coerce.number().int().min(0).max(50).default(1),
  status: z.enum(['draft', 'active', 'inactive']).default('active'),
  availabilityStatus: z.enum(['available', 'unavailable', 'maintenance']).default('available'),
  amenities: z.array(z.string().trim().min(2).max(120)).max(30).default([])
});
