import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess } from '@/server/utils/apiResponse';
import { BadRequestError } from '@/server/utils/AppError';
import { getChatHistory } from '@/server/modules/ai/ai.service';

type RouteContext = { params: Promise<{ petId: string }> };

// ─── GET /api/v1/ai/chat-history/:petId ──────────────
export const GET = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { petId } = await context.params;
    if (!petId || petId.length !== 24) {
        throw new BadRequestError('Invalid pet ID');
    }

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const result = await getChatHistory(petId, user.userId, page, limit);

    return sendSuccess('Chat history fetched successfully', result);
});
