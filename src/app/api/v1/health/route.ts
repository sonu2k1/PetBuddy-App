import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { sendSuccess } from '@/server/utils/apiResponse';
import { getRedisClient } from '@/server/config/redis';

export const GET = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);

    // Make sure services are connected
    await bootstrap();

    const mongoStatus =
        mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    let redisStatus = 'disconnected';
    try {
        const client = getRedisClient();
        const pong = await client.ping();
        redisStatus = pong === 'PONG' ? 'connected' : 'disconnected';
    } catch {
        redisStatus = 'disconnected';
    }

    return sendSuccess('PetBuddy API is healthy 🐾', {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
            mongodb: mongoStatus,
            redis: redisStatus,
        },
    });
});
