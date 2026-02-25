import { NextRequest } from 'next/server';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/AppError';

// ─── Role Definitions ────────────────────────────────
export const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    VETERINARIAN: 'veterinarian',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Extracts and verifies the JWT access token from request headers.
 * Returns the decoded payload or throws UnauthorizedError.
 */
export const authenticate = (req: NextRequest): TokenPayload => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyAccessToken(token);
        return { userId: decoded.userId, role: decoded.role };
    } catch {
        throw new UnauthorizedError('Invalid or expired access token');
    }
};

/**
 * Checks if the user has one of the required roles.
 * Throws ForbiddenError if not authorized.
 */
export const authorize = (user: TokenPayload, ...roles: string[]): void => {
    if (!roles.includes(user.role)) {
        throw new ForbiddenError(
            `This action requires one of the following roles: ${roles.join(', ')}`,
        );
    }
};

/**
 * Higher-order function that wraps a Route Handler with both
 * authentication and role-based authorization.
 *
 * Usage:
 *   export const POST = withRole('admin', 'moderator')(async (req, user) => {
 *     // user is guaranteed to be admin or moderator
 *   });
 */
export const withRole = (...allowedRoles: string[]) => {
    return (
        handler: (req: NextRequest, user: TokenPayload, context?: any) => Promise<Response>,
    ) => {
        return async (req: NextRequest, context?: any): Promise<Response> => {
            const user = authenticate(req);
            authorize(user, ...allowedRoles);
            return handler(req, user, context);
        };
    };
};

/**
 * Admin-only shorthand.
 *
 * Usage:
 *   export const GET = adminOnly(async (req, user) => { ... });
 */
export const adminOnly = (
    handler: (req: NextRequest, user: TokenPayload, context?: any) => Promise<Response>,
) => withRole(ROLES.ADMIN)(handler);

/**
 * Moderator + Admin shorthand.
 */
export const modOrAdmin = (
    handler: (req: NextRequest, user: TokenPayload, context?: any) => Promise<Response>,
) => withRole(ROLES.ADMIN, ROLES.MODERATOR)(handler);
