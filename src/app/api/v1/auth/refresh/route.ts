import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { refreshTokenSchema } from '@/server/modules/auth/auth.schema';
import { refreshAccessToken } from '@/server/modules/auth/auth.service';
import { ZodError } from 'zod';

export const POST = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    // ── Parse & validate body ──────────────────────────
    const body = await req.json();

    let validated;
    try {
        validated = refreshTokenSchema.parse(body);
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

    // ── Refresh tokens ─────────────────────────────────
    const result = await refreshAccessToken(validated.refreshToken);

    return sendSuccess('Token refreshed successfully', result, 200);
});
