import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { createPostSchema, postListQuerySchema } from '@/server/modules/community/post.schema';
import { createPost, getPosts } from '@/server/modules/community/post.service';
import { ZodError } from 'zod';

// ─── POST /api/v1/posts — Create a community post ───
export const POST = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);
    const body = await req.json();

    let validated;
    try {
        validated = createPostSchema.parse(body);
    } catch (error) {
        if (error instanceof ZodError) {
            return sendError(
                'Validation failed',
                400,
                error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
            );
        }
        throw error;
    }

    const post = await createPost(user.userId, validated);

    return sendSuccess('Post created successfully', post, 201);
});

// ─── GET /api/v1/posts — List community posts ───────
export const GET = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const { searchParams } = req.nextUrl;
    const rawQuery: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        rawQuery[key] = value;
    });

    let validated;
    try {
        validated = postListQuerySchema.parse(rawQuery);
    } catch (error) {
        if (error instanceof ZodError) {
            return sendError(
                'Invalid query parameters',
                400,
                error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
            );
        }
        throw error;
    }

    const result = await getPosts(validated);

    return sendSuccess('Posts fetched successfully', result);
});
