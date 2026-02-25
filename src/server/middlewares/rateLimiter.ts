import { NextRequest } from 'next/server';
import { getRedisClient } from '../config/redis';
import { TooManyRequestsError } from '../utils/AppError';

interface RateLimitOptions {
    windowMs: number;    // Time window in milliseconds
    max: number;         // Max requests per window
    keyPrefix?: string;  // Redis key prefix
}

interface RateLimitResult {
    remaining: number;
    resetAt: number;     // Epoch ms
}

/**
 * Rate limiter using Redis. Call at the start of a Route Handler.
 * Throws TooManyRequestsError if limit exceeded.
 * Returns remaining count and reset time for response headers.
 *
 * Usage:
 *   const rl = await rateLimit(req, { windowMs: 900000, max: 100 });
 */
export const rateLimit = async (
    req: NextRequest,
    options: RateLimitOptions = { windowMs: 900_000, max: 100 },
): Promise<RateLimitResult> => {
    const { windowMs, max, keyPrefix = 'rl' } = options;

    // Use IP or fallback to a generic key
    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'anonymous';

    const key = `${keyPrefix}:${ip}`;
    const windowSeconds = Math.ceil(windowMs / 1000);

    try {
        const redis = getRedisClient();
        const current = await redis.incr(key);

        if (current === 1) {
            await redis.expire(key, windowSeconds);
        }

        const ttl = await redis.ttl(key);
        const resetAt = Date.now() + ttl * 1000;
        const remaining = Math.max(0, max - current);

        if (current > max) {
            throw new TooManyRequestsError(
                `Rate limit exceeded. Try again in ${ttl} seconds.`,
            );
        }

        return { remaining, resetAt };
    } catch (error) {
        // If it's our own rate limit error, rethrow
        if (error instanceof TooManyRequestsError) throw error;
        // If Redis is down, fail open (allow request)
        return { remaining: max, resetAt: Date.now() + windowMs };
    }
};

// ─── Presets ─────────────────────────────────────────

/** Global rate limit: 200 requests per 15 minutes */
export const globalRateLimit = async (req: NextRequest) => {
    return rateLimit(req, {
        windowMs: 15 * 60 * 1000,
        max: 200,
        keyPrefix: 'rl:global',
    });
};

/** Auth rate limit: 20 requests per 15 minutes */
export const authRateLimit = async (req: NextRequest) => {
    return rateLimit(req, {
        windowMs: 15 * 60 * 1000,
        max: 20,
        keyPrefix: 'rl:auth',
    });
};

/** AI rate limit: 30 requests per hour */
export const aiRateLimit = async (req: NextRequest) => {
    return rateLimit(req, {
        windowMs: 60 * 60 * 1000,
        max: 30,
        keyPrefix: 'rl:ai',
    });
};

/** Upload rate limit: 10 uploads per 10 minutes */
export const uploadRateLimit = async (req: NextRequest) => {
    return rateLimit(req, {
        windowMs: 10 * 60 * 1000,
        max: 10,
        keyPrefix: 'rl:upload',
    });
};
