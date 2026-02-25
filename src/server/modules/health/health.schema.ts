import { z } from 'zod';

const recordTypeEnum = z.enum(['vaccination', 'weight', 'treatment']);

export const createHealthRecordSchema = z.object({
    type: recordTypeEnum,
    date: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    notes: z
        .string()
        .trim()
        .max(1000, 'Notes cannot exceed 1000 characters')
        .optional()
        .default(''),
    documentUrl: z.string().url('Invalid document URL').nullish(),
});

export type CreateHealthRecordInput = z.infer<typeof createHealthRecordSchema>;
