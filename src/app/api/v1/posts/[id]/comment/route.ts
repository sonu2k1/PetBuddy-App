import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { BadRequestError } from '@/server/utils/AppError';
import { addCommentSchema } from '@/server/modules/community/post.schema';
import { addComment } from '@/server/modules/community/post.service';
import { ZodError } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

// ─── POST /api/v1/posts/:id/comment ──────────────────
export const POST = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { id } = await context.params;
    if (!id || id.length !== 24) {
        throw new BadRequestError('Invalid post ID');
    }

    const body = await req.json();

    let validated;
    try {
        validated = addCommentSchema.parse(body);
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

    const post = await addComment(id, user.userId, validated);

    return sendSuccess('Comment added successfully', {
        commentsCount: post.comments.length,
        latestComment: post.comments[post.comments.length - 1],
    }, 201);
});
