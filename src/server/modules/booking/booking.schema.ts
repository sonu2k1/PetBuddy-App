import { z } from 'zod';

// ─── Available Services ──────────────────────────────
export const AVAILABLE_SERVICES = [
    'grooming',
    'vaccination',
    'consultation',
    'dental-checkup',
    'deworming',
    'training',
    'spa',
    'boarding',
] as const;

// ─── Time Slots ──────────────────────────────────────
export const TIME_SLOTS = [
    '09:00 - 09:30',
    '09:30 - 10:00',
    '10:00 - 10:30',
    '10:30 - 11:00',
    '11:00 - 11:30',
    '11:30 - 12:00',
    '12:00 - 12:30',
    '14:00 - 14:30',
    '14:30 - 15:00',
    '15:00 - 15:30',
    '15:30 - 16:00',
    '16:00 - 16:30',
    '16:30 - 17:00',
    '17:00 - 17:30',
] as const;

const MAX_BOOKINGS_PER_SLOT = 3;

export { MAX_BOOKINGS_PER_SLOT };

// ─── Book Service ────────────────────────────────────
export const createBookingSchema = z.object({
    serviceName: z.enum(AVAILABLE_SERVICES, {
        message: `Service must be one of: ${AVAILABLE_SERVICES.join(', ')}`,
    }),
    date: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
        .refine((val) => {
            const d = new Date(val);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return d >= today;
        }, 'Date must be today or in the future'),
    timeSlot: z.enum(TIME_SLOTS, {
        message: 'Invalid time slot',
    }),
    notes: z
        .string()
        .trim()
        .max(500, 'Notes cannot exceed 500 characters')
        .optional()
        .default(''),
});

// ─── Slots Query ─────────────────────────────────────
export const slotsQuerySchema = z.object({
    serviceName: z.enum(AVAILABLE_SERVICES, {
        message: `Service must be one of: ${AVAILABLE_SERVICES.join(', ')}`,
    }),
    date: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type SlotsQueryInput = z.infer<typeof slotsQuerySchema>;
