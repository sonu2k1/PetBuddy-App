import { z } from 'zod';

const genderEnum = z.enum(['male', 'female']);
const healthStatusEnum = z.enum(['healthy', 'sick', 'recovering', 'critical', 'unknown']);

// ─── Create Pet ──────────────────────────────────────
export const createPetSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Pet name is required')
        .max(50, 'Name cannot exceed 50 characters'),
    breed: z
        .string()
        .trim()
        .min(1, 'Breed is required')
        .max(80, 'Breed cannot exceed 80 characters'),
    gender: genderEnum,
    dob: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    weight: z
        .number()
        .min(0.1, 'Weight must be greater than 0')
        .max(200, 'Weight cannot exceed 200 kg'),
    healthStatus: healthStatusEnum.optional().default('healthy'),
    imageUrl: z.string().optional().transform(v => v || null),
    qrCodeId: z.string().trim().nullish(),
    isLostMode: z.boolean().optional().default(false),
});

// ─── Update Pet (all optional) ───────────────────────
export const updatePetSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Pet name cannot be empty')
        .max(50, 'Name cannot exceed 50 characters')
        .optional(),
    breed: z
        .string()
        .trim()
        .min(1, 'Breed cannot be empty')
        .max(80, 'Breed cannot exceed 80 characters')
        .optional(),
    gender: genderEnum.optional(),
    dob: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
        .optional(),
    weight: z
        .number()
        .min(0.1, 'Weight must be greater than 0')
        .max(200, 'Weight cannot exceed 200 kg')
        .optional(),
    healthStatus: healthStatusEnum.optional(),
    imageUrl: z.string().optional().transform(v => v || null),
    qrCodeId: z.string().trim().nullish(),
    isLostMode: z.boolean().optional(),
});

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
