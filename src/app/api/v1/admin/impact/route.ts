import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { impactListQuerySchema } from '@/server/modules/impact/impact.schema';
import { getImpactFunds } from '@/server/modules/impact/impact.service';
import { ZodError } from 'zod';

// ─── GET /api/v1/admin/impact — List impact funds ────
export const GET = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    // Admin auth — currently just requires authentication
    // TODO: Add role-based check when admin roles are implemented
    authenticate(req);

    const { searchParams } = req.nextUrl;
    const rawQuery: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        rawQuery[key] = value;
    });

    let validated;
    try {
        validated = impactListQuerySchema.parse(rawQuery);
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

    const result = await getImpactFunds(validated);

    return sendSuccess('Impact funds fetched successfully', result);
});
