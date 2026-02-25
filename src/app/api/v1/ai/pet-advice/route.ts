import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { petAdviceSchema } from '@/server/modules/ai/ai.schema';
import { getPetAdvice } from '@/server/modules/ai/ai.service';
import { ZodError } from 'zod';

// ─── POST /api/v1/ai/pet-advice ──────────────────────
export const POST = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const body = await req.json();

    let validated;
    try {
        validated = petAdviceSchema.parse(body);
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

    const result = await getPetAdvice(user.userId, validated);

    return sendSuccess('AI advice generated successfully', result);
});
