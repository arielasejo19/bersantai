import { z } from 'zod';

const optionalText = (max) => z.string().trim().max(max).optional().nullable();
const mediaUrl = z.string().max(1000).refine((value) => /^https?:\/\/\S+$/i.test(value) || value.startsWith('/uploads/'), 'Media URL must be an HTTP URL or uploaded media path');
const checkTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must use HH:mm format');

export const villaSchema = z.object({
  name: z.string().trim().min(2).max(180), slug: z.string().trim().min(2).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  location: z.string().trim().min(2).max(255), villaTypeId: z.coerce.number().int().positive().nullable().optional(), description: optionalText(5000), nightlyPrice: z.coerce.number().min(0),
  capacity: z.coerce.number().int().min(1).max(100), bedroomCount: z.coerce.number().int().min(1).max(50),
  amenities: z.array(z.string().trim().min(2).max(120)).max(30).default([]),
  photos: z.array(z.object({ url: mediaUrl, mediaType: z.enum(['image', 'video']), altText: optionalText(255), isThumbnail: z.boolean().default(false), sortOrder: z.coerce.number().int().min(0).default(0) })).max(30).default([]),
  status: z.enum(['draft', 'active', 'inactive']), availabilityStatus: z.enum(['available', 'unavailable', 'maintenance']), stayType: z.enum(['day_tour', 'overnight', 'both']).default('both'), standardCheckIn: checkTime.default('15:00'), standardCheckOut: checkTime.default('11:00'), ownerUserId: z.coerce.number().int().positive().nullable().optional()
});

export const amenitySchema = z.object({ name: z.string().trim().min(2).max(120) });
export const photoSchema = z.object({ url: z.string().url().max(1000), altText: optionalText(255), sortOrder: z.coerce.number().int().min(0).default(0) });
export const staffInviteSchema = z.object({ email: z.string().email().max(255), displayName: z.string().trim().min(2).max(150), role: z.enum(['host', 'receptionist']), password: z.string().min(12).max(200).optional() });
export const reservationStatusSchema = z.object({ status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']) });
export const bookingSchema = z.object({
  villaId: z.coerce.number().int().positive().nullable().optional(),
  villaTypeId: z.coerce.number().int().positive().nullable().optional(),
  bookingKind: z.enum(['overnight', 'day_tour']).default('overnight'),
  serviceIds: z.array(z.coerce.number().int().positive()).max(30).default([]),
  menuItemIds: z.array(z.coerce.number().int().positive()).max(30).default([]),
  serviceQuantities: z.record(z.string(), z.coerce.number().int().positive()).default({}),
  menuQuantities: z.record(z.string(), z.coerce.number().int().positive()).default({}),
  paymentMethod: z.enum(['card', 'online', 'bank_transfer', 'pay_later', 'cash']).default('cash'),
  totalAmount: z.coerce.number().min(0).default(0),
  verificationToken: z.string().uuid().optional(),
  guestName: z.string().trim().min(2).max(180),
  guestEmail: z.string().email().max(255),
  guestNote: z.string().trim().max(1000).default(''),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date().optional(),
  guests: z.coerce.number().int().min(1).max(100)
}).superRefine((value, context) => {
  if (!value.villaId && !value.villaTypeId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['villaId'], message: 'A villa or villa type is required' });
  }
  if (value.bookingKind === 'overnight' && (!value.checkOut || value.checkOut <= value.checkIn)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['checkOut'], message: 'Check-out must be after check-in' });
  }
});