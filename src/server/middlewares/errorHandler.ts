import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { sendError } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * Wraps a Next.js Route Handler to provide centralized error handling.
 *
 * Catches and formats:
 * - AppError (custom operational errors)
 * - ZodError (validation failures)
 * - Mongoose ValidationError
 * - Mongoose duplicate key (code 11000)
 * - JWT errors
 * - Unknown/unexpected errors
 *
 * Usage:
 *   export const GET = withErrorHandler(async (req) => { ... });
 */
export function withErrorHandler(
    handler: (req: NextRequest, context?: any) => Promise<Response>,
) {
    return async (req: NextRequest, context?: any): Promise<Response> => {
        const requestId = req.headers.get('x-request-id') || '-';

        try {
            return await handler(req, context);
        } catch (error) {
            // ── AppError (our custom errors) ─────────────────
            if (error instanceof AppError) {
                logger.warn(
                    `⚠️  [${error.statusCode}] ${error.message} | ReqID: ${requestId}`,
                );
                return sendError(error.message, error.statusCode);
            }

            // ── Zod validation error ─────────────────────────
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                }));
                logger.warn(
                    `⚠️  Validation failed: ${formattedErrors.length} issue(s) | ReqID: ${requestId}`,
                );
                return sendError('Validation failed', 400, formattedErrors);
            }

            // ── Mongoose validation error ────────────────────
            if (error instanceof Error && error.name === 'ValidationError') {
                logger.warn(
                    `⚠️  Mongoose validation: ${error.message} | ReqID: ${requestId}`,
                );
                return sendError(error.message, 400);
            }

            // ── Mongoose duplicate key ───────────────────────
            if (error instanceof Error && (error as any).code === 11000) {
                const keyValue = (error as any).keyValue || {};
                const field = Object.keys(keyValue)[0] || 'unknown';
                logger.warn(
                    `⚠️  Duplicate key on field "${field}" | ReqID: ${requestId}`,
                );
                return sendError(
                    `Duplicate value for "${field}". This resource already exists.`,
                    409,
                );
            }

            // ── Mongoose CastError (bad ObjectId) ────────────
            if (error instanceof Error && error.name === 'CastError') {
                return sendError('Invalid ID format', 400);
            }

            // ── JWT errors ───────────────────────────────────
            if (error instanceof Error && error.name === 'JsonWebTokenError') {
                return sendError('Invalid token', 401);
            }
            if (error instanceof Error && error.name === 'TokenExpiredError') {
                return sendError('Token has expired', 401);
            }

            // ── SyntaxError (malformed JSON body) ────────────
            if (error instanceof SyntaxError && error.message.includes('JSON')) {
                return sendError('Invalid JSON in request body', 400);
            }

            // ── Unknown / unexpected error ───────────────────
            logger.error(`💀 Unexpected error | ReqID: ${requestId}:`, error);
            const message =
                process.env.NODE_ENV === 'development' && error instanceof Error
                    ? error.message
                    : 'Internal Server Error';
            return sendError(message, 500);
        }
    };
}
