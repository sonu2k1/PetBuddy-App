import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { BadRequestError } from '@/server/utils/AppError';
import { updateImpactSchema } from '@/server/modules/impact/impact.schema';
import { updateImpactFund } from '@/server/modules/impact/impact.service';
import { ZodError } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

// ─── PATCH /api/v1/admin/impact/:id — Update fund ────
export const PATCH = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    // Admin auth
    authenticate(req);

    const { id } = await context.params;
    if (!id || id.length !== 24) {
        throw new BadRequestError('Invalid impact fund ID');
    }

    const body = await req.json();

    let validated;
    try {
        validated = updateImpactSchema.parse(body);
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

    const fund = await updateImpactFund(id, validated);

    return sendSuccess('Impact fund updated successfully', fund);
});
