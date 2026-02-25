import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { createBookingSchema } from '@/server/modules/booking/booking.schema';
import { createBooking } from '@/server/modules/booking/booking.service';
import { ZodError } from 'zod';

// ─── POST /api/v1/services/book — Book a service ────
export const POST = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);
    const body = await req.json();

    let validated;
    try {
        validated = createBookingSchema.parse(body);
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

    const booking = await createBooking(user.userId, validated);

    return sendSuccess('Service booked successfully', booking, 201);
});
