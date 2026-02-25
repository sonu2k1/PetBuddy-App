import { z } from 'zod';

// ─── Update Impact Fund (Admin) ──────────────────────
export const updateImpactSchema = z.object({
    usedFor: z
        .string()
        .trim()
        .min(1, 'Usage description is required')
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
    status: z.enum(['pending', 'allocated', 'disbursed']).optional(),
});

// ─── List Query ──────────────────────────────────────
export const impactListQuerySchema = z.object({
    status: z.enum(['pending', 'allocated', 'disbursed']).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type UpdateImpactInput = z.infer<typeof updateImpactSchema>;
export type ImpactListQuery = z.infer<typeof impactListQuerySchema>;
