import { z } from 'zod';

export const reservationChargeSchema = z.object({
  itemType: z.enum(['food', 'service']),
  itemId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(100).default(1)
});

export const reservationPaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  paymentMethod: z.enum(['cash', 'card', 'online', 'bank_transfer']),
  reference: z.string().trim().max(120).optional().nullable()
});