import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { BadRequestError } from '@/server/utils/AppError';
import { updateReminderSchema } from '@/server/modules/reminder/reminder.schema';
import { updateReminder, deleteReminder } from '@/server/modules/reminder/reminder.service';
import { ZodError } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

// ─── PATCH /api/v1/reminders/:id — Update reminder ──
export const PATCH = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { id } = await context.params;
    if (!id || id.length !== 24) {
        throw new BadRequestError('Invalid reminder ID');
    }

    const body = await req.json();

    let validated;
    try {
        validated = updateReminderSchema.parse(body);
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

    const updated = await updateReminder(id, user.userId, validated);

    return sendSuccess('Reminder updated successfully', updated);
});

// ─── DELETE /api/v1/reminders/:id — Delete reminder ──
export const DELETE = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { id } = await context.params;
    if (!id || id.length !== 24) {
        throw new BadRequestError('Invalid reminder ID');
    }

    await deleteReminder(id, user.userId);

    return sendSuccess('Reminder deleted successfully', null);
});
