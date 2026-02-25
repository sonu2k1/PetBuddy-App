import { z } from 'zod';

// ─── Query Params for listing ────────────────────────
export const productListQuerySchema = z.object({
    pincode: z.string().trim().optional(),
    category: z.string().trim().optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
    sortBy: z.enum(['price', 'createdAt', 'discount']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
