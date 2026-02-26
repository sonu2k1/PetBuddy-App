import { z } from 'zod';

const repeatEnum = z.enum(['daily', 'weekly', 'monthly', 'none']);

// ─── Create Reminder ─────────────────────────────────
export const createReminderSchema = z.object({
    petId: z
        .string()
        .trim()
        .length(24, 'Invalid pet ID'),
    type: z
        .string()
        .trim()
        .min(1, 'Reminder type is required')
        .max(100, 'Type cannot exceed 100 characters'),
    scheduledAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    repeat: repeatEnum.optional().default('none'),
    isActive: z.boolean().optional().default(true),
});

// ─── Update Reminder ─────────────────────────────────
export const updateReminderSchema = z.object({
    type: z
        .string()
        .trim()
        .min(1, 'Reminder type cannot be empty')
        .max(100, 'Type cannot exceed 100 characters')
        .optional(),
    scheduledAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
        .optional(),
    repeat: repeatEnum.optional(),
    isActive: z.boolean().optional(),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
