import { z } from 'zod';

export const pricingRuleSchema = z.object({
  scopeType: z.enum(['villa', 'villa_type']).default('villa'),
  villaId: z.coerce.number().int().positive().nullable().optional(),
  villaTypeId: z.coerce.number().int().positive().nullable().optional(),
  name: z.string().trim().min(2).max(180),
  stayType: z.enum(['both', 'overnight', 'day_tour']).default('both'),
  ruleType: z.enum(['weekday', 'weekend', 'holiday']),
  startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  price: z.coerce.number().min(0),
  isActive: z.boolean().default(true)
}).superRefine((value, context) => {
  if (value.scopeType === 'villa' && !value.villaId) context.addIssue({ code: z.ZodIssueCode.custom, path: ['villaId'], message: 'Choose a villa' });
  if (value.scopeType === 'villa_type' && !value.villaTypeId) context.addIssue({ code: z.ZodIssueCode.custom, path: ['villaTypeId'], message: 'Choose a villa type' });
  if (value.ruleType === 'holiday' && (!value.startsOn || !value.endsOn)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['startsOn'], message: 'Holiday rules need a start and end date' });
  }
  if (value.startsOn && value.endsOn && value.endsOn < value.startsOn) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['endsOn'], message: 'End date must be on or after the start date' });
  }
  if (value.ruleType !== 'holiday' && (value.startsOn || value.endsOn)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['startsOn'], message: 'Only holiday rules use dates' });
  }
});