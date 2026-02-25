import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { verifyOtpSchema } from '@/server/modules/auth/auth.schema';
import { verifyOtp } from '@/server/modules/auth/auth.service';
import { ZodError } from 'zod';

export const POST = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    // ── Parse & validate body ──────────────────────────
    const body = await req.json();

    let validated;
    try {
        validated = verifyOtpSchema.parse(body);
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

    // ── Verify OTP ─────────────────────────────────────
    const result = await verifyOtp(validated.phone, validated.otp);

    const statusCode = result.isNewUser ? 201 : 200;
    const message = result.isNewUser
        ? 'Account created and authenticated'
        : 'Authenticated successfully';

    return sendSuccess(message, result, statusCode);
});
