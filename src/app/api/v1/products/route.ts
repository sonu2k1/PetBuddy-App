import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { productListQuerySchema } from '@/server/modules/product/product.schema';
import { getProducts } from '@/server/modules/product/product.service';
import { ZodError } from 'zod';

// ─── GET /api/v1/products — List products ────────────
export const GET = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const { searchParams } = req.nextUrl;

    // Build query object from search params
    const rawQuery: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        rawQuery[key] = value;
    });

    let validated;
    try {
        validated = productListQuerySchema.parse(rawQuery);
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

    const result = await getProducts(validated);

    return sendSuccess('Products fetched successfully', result);
});
