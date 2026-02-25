import { z } from 'zod';

// ─── Post Categories ─────────────────────────────────
export const POST_CATEGORIES = [
    'general',
    'tips',
    'health',
    'adoption',
    'lost-found',
    'funny',
    'question',
    'event',
] as const;

// ─── Create Post ─────────────────────────────────────
export const createPostSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, 'Content is required')
        .max(3000, 'Content cannot exceed 3000 characters'),
    imageUrl: z.string().trim().optional().or(z.literal('')),
    category: z.enum(POST_CATEGORIES, {
        message: `Category must be one of: ${POST_CATEGORIES.join(', ')}`,
    }),
});

// ─── Add Comment ─────────────────────────────────────
export const addCommentSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, 'Comment content is required')
        .max(500, 'Comment cannot exceed 500 characters'),
});

// ─── Report Post ─────────────────────────────────────
export const reportPostSchema = z.object({
    reason: z
        .string()
        .trim()
        .min(1, 'Report reason is required')
        .max(300, 'Reason cannot exceed 300 characters'),
});

// ─── List Query ──────────────────────────────────────
export const postListQuerySchema = z.object({
    category: z.enum(POST_CATEGORIES).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type ReportPostInput = z.infer<typeof reportPostSchema>;
export type PostListQuery = z.infer<typeof postListQuerySchema>;
