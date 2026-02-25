import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { sendSuccess } from '@/server/utils/apiResponse';
import { BadRequestError } from '@/server/utils/AppError';
import { getRescueReportById } from '@/server/modules/rescue/rescue.service';

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/v1/rescue/:id — Get single report ─────
export const GET = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const { id } = await context.params;
    if (!id || id.length !== 24) {
        throw new BadRequestError('Invalid rescue report ID');
    }

    const report = await getRescueReportById(id);

    return sendSuccess('Rescue report fetched successfully', report);
});
