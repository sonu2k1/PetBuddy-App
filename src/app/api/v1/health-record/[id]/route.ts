import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess } from '@/server/utils/apiResponse';
import { BadRequestError } from '@/server/utils/AppError';
import { deleteHealthRecord } from '@/server/modules/health/health.service';

type RouteContext = { params: Promise<{ id: string }> };

// ─── DELETE /api/v1/health-record/:id ────────────────
export const DELETE = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { id: recordId } = await context.params;
    if (!recordId || recordId.length !== 24) {
        throw new BadRequestError('Invalid health record ID');
    }

    await deleteHealthRecord(recordId, user.userId);

    return sendSuccess('Health record deleted successfully', null);
});
