import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess } from '@/server/utils/apiResponse';
import { getUserVaccinations } from '@/server/modules/health/health.service';

// ─── GET /api/v1/vaccinations — All vaccinations for user's pets ──
export const GET = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { searchParams } = req.nextUrl;
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const vaccinations = await getUserVaccinations(user.userId, { limit });

    return sendSuccess('Vaccinations fetched successfully', { vaccinations });
});
