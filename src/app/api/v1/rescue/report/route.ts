import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { createRescueReportSchema, rescueListQuerySchema } from '@/server/modules/rescue/rescue.schema';
import { createRescueReport, getRescueReports } from '@/server/modules/rescue/rescue.service';
import { ZodError } from 'zod';

// ─── POST /api/v1/rescue/report — Create rescue report ─
export const POST = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);
    const body = await req.json();

    // Extract photo data (base64 or URL) separately
    const { photo, ...reportData } = body;

    let validated;
    try {
        validated = createRescueReportSchema.parse(reportData);
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

    const report = await createRescueReport(
        user.userId,
        validated,
        photo || undefined,
    );

    return sendSuccess('Rescue report created successfully', report, 201);
});
