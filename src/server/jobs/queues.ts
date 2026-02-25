import { logger } from '../utils/logger';

// ─── BullMQ requires a TCP Redis connection ─────────────
// Upstash REST API is not compatible with BullMQ.
// These queues are no-ops until a local/TCP Redis is configured.

const REDIS_AVAILABLE = !!(process.env.REDIS_HOST && process.env.REDIS_PORT);

// Lazy-load BullMQ only when TCP Redis is available
let _emailQueue: import('bullmq').Queue | null = null;
let _notificationQueue: import('bullmq').Queue | null = null;

const getRedisConnection = () => ({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null as unknown as undefined,
});

/** Get the email queue (null if TCP Redis is unavailable) */
export const getEmailQueue = () => {
    if (!REDIS_AVAILABLE) return null;
    if (!_emailQueue) {
        const { Queue } = require('bullmq') as typeof import('bullmq');
        _emailQueue = new Queue('email', {
            connection: getRedisConnection(),
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
            },
        });
    }
    return _emailQueue;
};

/** Get the notification queue (null if TCP Redis is unavailable) */
export const getNotificationQueue = () => {
    if (!REDIS_AVAILABLE) return null;
    if (!_notificationQueue) {
        const { Queue } = require('bullmq') as typeof import('bullmq');
        _notificationQueue = new Queue('notification', {
            connection: getRedisConnection(),
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
            },
        });
    }
    return _notificationQueue;
};

// Backward compat — these will be null when TCP Redis is not configured
export const emailQueue = null as import('bullmq').Queue | null;
export const notificationQueue = null as import('bullmq').Queue | null;

// ─── Worker Initialisation ───────────────────────────
let workersInitialised = false;

export const initWorkers = (): void => {
    if (!REDIS_AVAILABLE) {
        logger.warn('⚠️  BullMQ workers skipped — no TCP Redis configured (using Upstash REST)');
        return;
    }
    if (workersInitialised) return;

    const { Worker, Job } = require('bullmq') as typeof import('bullmq');
    const connection = getRedisConnection();

    const processEmailJob = async (job: import('bullmq').Job): Promise<void> => {
        logger.info(`📧 Processing email job ${job.id}: ${job.data.to}`);
        // TODO: Integrate your email service (SendGrid, Nodemailer, etc.)
        logger.info(`📧 Email job ${job.id} completed`);
    };

    const processNotificationJob = async (job: import('bullmq').Job): Promise<void> => {
        logger.info(`🔔 Processing notification job ${job.id}`);
        // TODO: Implement push notification / in-app notification logic
        logger.info(`🔔 Notification job ${job.id} completed`);
    };

    const emailWorker = new Worker('email', processEmailJob, {
        connection,
        concurrency: 5,
    });

    const notificationWorker = new Worker('notification', processNotificationJob, {
        connection,
        concurrency: 5,
    });

    [emailWorker, notificationWorker].forEach((worker) => {
        worker.on('completed', (job) => {
            logger.info(`✅ Job ${job.id} in queue "${job.queueName}" completed`);
        });

        worker.on('failed', (job, err) => {
            logger.error(`❌ Job ${job?.id} in queue "${job?.queueName}" failed: ${err.message}`);
        });
    });

    workersInitialised = true;
    logger.info('🏭 BullMQ workers initialised');
};
