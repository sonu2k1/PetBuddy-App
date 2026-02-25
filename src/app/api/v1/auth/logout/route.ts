import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess } from '@/server/utils/apiResponse';
import { logout } from '@/server/modules/auth/auth.service';

export const POST = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    // ── Authenticate (requires valid access token) ─────
    const user = authenticate(req);

    // ── Logout ─────────────────────────────────────────
    const result = await logout(user.userId);

    return sendSuccess(result.message, null, 200);
});
