import { connectMongoDB } from './config/database';
import { connectRedis } from './config/redis';
import { configureCloudinary } from './config/cloudinary';
import { logger } from './utils/logger';

/**
 * Ensures all server-side services are connected.
 * Call this at the top of any Route Handler that needs DB/Redis.
 * Safe to call multiple times (idempotent).
 */
export const bootstrap = async (): Promise<void> => {
    await connectMongoDB();
    connectRedis();
    configureCloudinary();
};

// Log that the server module is loaded
logger.info('🐾 PetBuddy server module loaded');
