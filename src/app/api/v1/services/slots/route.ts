import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { slotsQuerySchema } from '@/server/modules/booking/booking.schema';
import { getAvailableSlots } from '@/server/modules/booking/booking.service';
import { ZodError } from 'zod';

// ─── GET /api/v1/services/slots — Get available slots ─
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
        validated = slotsQuerySchema.parse(rawQuery);
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

    const result = await getAvailableSlots(validated);

    return sendSuccess('Slots fetched successfully', result);
});
