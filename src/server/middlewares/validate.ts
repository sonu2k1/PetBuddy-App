import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

interface ValidationRule<T = unknown> {
    schema: ZodSchema<T>;
    target: ValidationTarget;
}

/**
 * Validates request data against a Zod schema.
 * Returns parsed data on success, or a NextResponse error on failure.
 *
 * Usage (simple):
 *   const result = validateRequest(schema, data);
 *   if (result instanceof NextResponse) return result;
 *
 * Usage (multiple targets):
 *   const result = validateMultiple(req, [
 *     { schema: bodySchema, target: 'body' },
 *     { schema: querySchema, target: 'query' },
 *   ]);
 */
export const validateRequest = <T>(
    schema: ZodSchema<T>,
    data: unknown,
): T | NextResponse => {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof ZodError) {
            const formattedErrors = error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            }));
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: formattedErrors },
                { status: 400 },
            );
        }
        throw error;
    }
};

/**
 * Extract query parameters from a NextRequest into a plain object.
 */
export const extractQuery = (req: NextRequest): Record<string, string> => {
    const result: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
        result[key] = value;
    });
    return result;
};

/**
 * Validate multiple request targets (body, query, params) at once.
 * Returns an object with validated data for each target, or a
 * NextResponse error if any validation fails.
 */
export const validateMultiple = async (
    req: NextRequest,
    rules: ValidationRule[],
    params?: Record<string, string>,
): Promise<Record<ValidationTarget, unknown> | NextResponse> => {
    const result: Record<string, unknown> = {};

    for (const rule of rules) {
        let data: unknown;

        switch (rule.target) {
            case 'body':
                try {
                    data = await req.json();
                } catch {
                    return NextResponse.json(
                        { success: false, message: 'Invalid JSON body' },
                        { status: 400 },
                    );
                }
                break;
            case 'query':
                data = extractQuery(req);
                break;
            case 'params':
                data = params || {};
                break;
        }

        const validated = validateRequest(rule.schema, data);
        if (validated instanceof NextResponse) return validated;
        result[rule.target] = validated;
    }

    return result;
};

/**
 * Type-safe validation helper that throws instead of returning a Response.
 * Use inside withErrorHandler for cleaner code.
 *
 * Usage:
 *   const data = validateOrThrow(schema, body);
 */
export const validateOrThrow = <T>(
    schema: ZodSchema<T>,
    data: unknown,
): T => {
    return schema.parse(data);
    // ZodError will bubble up to withErrorHandler
};
