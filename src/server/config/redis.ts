import { Redis } from '@upstash/redis';
import { logger } from '../utils/logger';

// Cache Upstash client globally to survive Next.js hot reloads in dev
const globalForRedis = globalThis as unknown as {
    upstashClient: Redis | undefined;
};

export const connectRedis = (): Redis => {
    if (globalForRedis.upstashClient) {
        return globalForRedis.upstashClient;
    }

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        throw new Error(
            'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN env vars',
        );
    }

    const client = new Redis({ url, token });

    globalForRedis.upstashClient = client;
    logger.info('🔴 Upstash Redis connected (REST)');
    return client;
};

export const getRedisClient = (): Redis => {
    if (!globalForRedis.upstashClient) {
        return connectRedis();
    }
    return globalForRedis.upstashClient;
};

export const disconnectRedis = async (): Promise<void> => {
    // Upstash REST client is stateless — no persistent connection to close
    globalForRedis.upstashClient = undefined;
    logger.info('Redis reference cleared');
};
