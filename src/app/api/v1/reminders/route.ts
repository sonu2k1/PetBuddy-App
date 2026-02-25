import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { createReminderSchema } from '@/server/modules/reminder/reminder.schema';
import { createReminder, getUserReminders } from '@/server/modules/reminder/reminder.service';
import { ZodError } from 'zod';

// ─── POST /api/v1/reminders — Create a reminder ─────
export const POST = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const body = await req.json();

    let validated;
    try {
        validated = createReminderSchema.parse(body);
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

    const reminder = await createReminder(user.userId, validated);

    return sendSuccess('Reminder created successfully', reminder, 201);
});

// ─── GET /api/v1/reminders — List user's reminders ──
export const GET = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const petId = searchParams.get('petId') || undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam !== null ? isActiveParam === 'true' : undefined;

    const result = await getUserReminders(user.userId, { page, limit, isActive, petId });

    return sendSuccess('Reminders fetched successfully', result);
});
