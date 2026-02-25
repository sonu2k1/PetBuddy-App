import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { rescueListQuerySchema } from '@/server/modules/rescue/rescue.schema';
import { getRescueReports } from '@/server/modules/rescue/rescue.service';
import { ZodError } from 'zod';

// ─── GET /api/v1/rescue — List rescue reports ────────
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
        validated = rescueListQuerySchema.parse(rawQuery);
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

    const result = await getRescueReports(validated);

    return sendSuccess('Rescue reports fetched successfully', result);
});
