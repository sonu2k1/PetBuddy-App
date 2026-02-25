import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess } from '@/server/utils/apiResponse';
import { BadRequestError } from '@/server/utils/AppError';
import { toggleLike } from '@/server/modules/community/post.service';

type RouteContext = { params: Promise<{ id: string }> };

// ─── POST /api/v1/posts/:id/like — Toggle like ──────
export const POST = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { id } = await context.params;
    if (!id || id.length !== 24) {
        throw new BadRequestError('Invalid post ID');
    }

    const result = await toggleLike(id, user.userId);

    return sendSuccess(
        result.liked ? 'Post liked' : 'Post unliked',
        result,
    );
});
