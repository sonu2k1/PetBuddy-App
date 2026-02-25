import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { BadRequestError } from '@/server/utils/AppError';
import { reportPostSchema } from '@/server/modules/community/post.schema';
import { reportPost } from '@/server/modules/community/post.service';
import { ZodError } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

// ─── POST /api/v1/posts/:id/report — Report a post ──
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
        validated = reportPostSchema.parse(body);
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

    const result = await reportPost(id, user.userId, validated);

    return sendSuccess(result.message, result);
});
