import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { BadRequestError } from '@/server/utils/AppError';
import { createHealthRecordSchema } from '@/server/modules/health/health.schema';
import { createHealthRecord } from '@/server/modules/health/health.service';
import { ZodError } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

// ─── POST /api/v1/pets/:id/health-record ─────────────
export const POST = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { id: petId } = await context.params;
    if (!petId || petId.length !== 24) {
        throw new BadRequestError('Invalid pet ID');
    }

    const body = await req.json();

    let validated;
    try {
        validated = createHealthRecordSchema.parse(body);
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

    const record = await createHealthRecord(petId, user.userId, validated);

    return sendSuccess('Health record created successfully', record, 201);
});
