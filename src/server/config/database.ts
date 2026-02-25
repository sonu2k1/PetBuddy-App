import mongoose from 'mongoose';
import { logger } from '../utils/logger';

let isConnected = false;

export const connectMongoDB = async (): Promise<void> => {
    if (isConnected) return;

    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/petbuddy';

    try {
        mongoose.set('strictQuery', true);

        mongoose.connection.on('connected', () => {
            logger.info('📦 MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        await mongoose.connect(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        isConnected = true;
    } catch (error) {
        logger.error('❌ Failed to connect to MongoDB:', error);
        throw error;
    }
};

export const disconnectMongoDB = async (): Promise<void> => {
    if (!isConnected) return;
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected gracefully');
};
