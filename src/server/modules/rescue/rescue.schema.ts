import { z } from 'zod';

// ─── Create Rescue Report ────────────────────────────
export const createRescueReportSchema = z.object({
    longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
    latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    address: z
        .string()
        .trim()
        .min(1, 'Address is required')
        .max(500, 'Address cannot exceed 500 characters'),
    description: z
        .string()
        .trim()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description cannot exceed 2000 characters'),
    // photoUrl is handled via Cloudinary upload, not from body validation
});

// ─── List Query ──────────────────────────────────────
export const rescueListQuerySchema = z.object({
    status: z.enum(['pending', 'verified', 'in-progress', 'rescued']).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    radiusKm: z.coerce.number().min(0.1).max(100).optional().default(10),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type CreateRescueReportInput = z.infer<typeof createRescueReportSchema>;
export type RescueListQuery = z.infer<typeof rescueListQuerySchema>;
