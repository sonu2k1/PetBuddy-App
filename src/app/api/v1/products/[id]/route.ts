import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { sendSuccess } from '@/server/utils/apiResponse';
import { BadRequestError } from '@/server/utils/AppError';
import { getProductById } from '@/server/modules/product/product.service';

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/v1/products/:id — Get single product ──
export const GET = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const { id } = await context.params;
    if (!id || id.length !== 24) {
        throw new BadRequestError('Invalid product ID');
    }

    const product = await getProductById(id);

    return sendSuccess('Product fetched successfully', product);
});
