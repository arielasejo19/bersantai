import { z } from 'zod';

const optionalText = (max) => z.string().trim().max(max).optional().nullable();

export const villaSchema = z.object({
  name: z.string().trim().min(2).max(180), slug: z.string().trim().min(2).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  location: z.string().trim().min(2).max(255), description: optionalText(5000), nightlyPrice: z.coerce.number().min(0),
  capacity: z.coerce.number().int().min(1).max(100), bedroomCount: z.coerce.number().int().min(1).max(50),
  amenities: z.array(z.string().trim().min(2).max(120)).max(30).default([]),
  photos: z.array(z.object({ url: z.string().url().max(1000), mediaType: z.enum(['image', 'video']), altText: optionalText(255), isThumbnail: z.boolean().default(false), sortOrder: z.coerce.number().int().min(0).default(0) })).max(30).default([]),
  status: z.enum(['draft', 'active', 'inactive']), availabilityStatus: z.enum(['available', 'unavailable', 'maintenance']), ownerUserId: z.coerce.number().int().positive().nullable().optional()
});

export const amenitySchema = z.object({ name: z.string().trim().min(2).max(120) });
export const photoSchema = z.object({ url: z.string().url().max(1000), altText: optionalText(255), sortOrder: z.coerce.number().int().min(0).default(0) });
export const staffInviteSchema = z.object({ email: z.string().email().max(255), displayName: z.string().trim().min(2).max(150), role: z.enum(['host', 'receptionist']), password: z.string().min(12).max(200).optional() });
export const reservationStatusSchema = z.object({ status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']) });
export const bookingSchema = z.object({
  villaId: z.coerce.number().int().positive(),
  guestName: z.string().trim().min(2).max(180),
  guestEmail: z.string().email().max(255),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  guests: z.coerce.number().int().min(1).max(100)
}).superRefine((value, context) => {
  if (value.checkOut <= value.checkIn) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['checkOut'], message: 'Check-out must be after check-in' });
  }
});