import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { updateCartSchema } from '@/server/modules/order/order.schema';
import { updateCart, getCart } from '@/server/modules/order/order.service';
import { ZodError } from 'zod';

// ─── POST /api/v1/cart — Update cart ─────────────────
export const POST = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);
    const body = await req.json();

    let validated;
    try {
        validated = updateCartSchema.parse(body);
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

    const cart = await updateCart(user.userId, validated);

    return sendSuccess('Cart updated successfully', cart);
});

// ─── GET /api/v1/cart — Get cart ─────────────────────
export const GET = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const cart = await getCart(user.userId);

    return sendSuccess('Cart fetched successfully', cart);
});
