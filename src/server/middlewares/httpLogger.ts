import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../utils/logger';

/**
 * Logs an incoming API request. Call at the top of any Route Handler.
 *
 * Usage:
 *   logRequest(req);
 */
export const logRequest = (req: NextRequest): void => {
    const method = req.method;
    const url = req.nextUrl.pathname;
    const query = req.nextUrl.search || '';
    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'unknown';
    const userAgent = req.headers.get('user-agent')?.substring(0, 100) || 'unknown';
    const requestId = req.headers.get('x-request-id') || '-';
    const contentLength = req.headers.get('content-length') || '0';

    logger.http(
        `→ ${method} ${url}${query} — IP: ${ip} | UA: ${userAgent} | ReqID: ${requestId} | Body: ${contentLength}B`,
    );
};

/**
 * Higher-order function wrapping a Route Handler to add response timing.
 * Logs both request and response with duration.
 *
 * Usage:
 *   export const GET = withRequestLog(async (req) => { ... });
 */
export const withRequestLog = (
    handler: (req: NextRequest, context?: any) => Promise<Response>,
) => {
    return async (req: NextRequest, context?: any): Promise<Response> => {
        const start = Date.now();
        const method = req.method;
        const url = req.nextUrl.pathname;
        const requestId = req.headers.get('x-request-id') || '-';

        logRequest(req);

        const response = await handler(req, context);

        const duration = Date.now() - start;
        const status = response.status;

        const logFn =
            status >= 500 ? logger.error :
                status >= 400 ? logger.warn :
                    logger.info;

        logFn(
            `← ${method} ${url} ${status} — ${duration}ms | ReqID: ${requestId}`,
        );

        return response;
    };
};
