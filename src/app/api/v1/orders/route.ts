import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { createOrderSchema } from '@/server/modules/order/order.schema';
import { createOrder, getUserOrders } from '@/server/modules/order/order.service';
import { ZodError } from 'zod';

// ─── POST /api/v1/orders — Place order from cart ─────
export const POST = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);
    const body = await req.json();

    let validated;
    try {
        validated = createOrderSchema.parse(body);
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

    const order = await createOrder(user.userId, validated);

    return sendSuccess('Order placed successfully', order, 201);
});

// ─── GET /api/v1/orders — List user's orders ─────────
export const GET = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const result = await getUserOrders(user.userId, page, limit);

    return sendSuccess('Orders fetched successfully', result);
});
