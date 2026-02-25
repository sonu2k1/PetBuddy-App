import { Queue, Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import Reminder from './reminder.model';
import Notification from './notification.model';
import Pet from '../pet/pet.model';
import { logger } from '@/server/utils/logger';

// ─── TCP Redis check (BullMQ needs TCP, not REST) ────
const REDIS_AVAILABLE = !!(process.env.REDIS_HOST && process.env.REDIS_PORT);

// ─── Redis connection config ─────────────────────────
const getRedisConnection = () => ({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null as unknown as undefined,
});

// ─── Queue ───────────────────────────────────────────
export const reminderQueue = REDIS_AVAILABLE
    ? new Queue('reminders', {
        connection: getRedisConnection(),
        defaultJobOptions: {
            removeOnComplete: 50,
            removeOnFail: 20,
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
        },
    })
    : (null as unknown as Queue);

// ─── Calculate next scheduled time ───────────────────
const getNextScheduledAt = (current: Date, repeat: string): Date | null => {
    const next = new Date(current);
    switch (repeat) {
        case 'daily':
            next.setDate(next.getDate() + 1);
            return next;
        case 'weekly':
            next.setDate(next.getDate() + 7);
            return next;
        case 'monthly':
            next.setMonth(next.getMonth() + 1);
            return next;
        default:
            return null;
    }
};

// ─── Job Processor ───────────────────────────────────
const processReminderJob = async (job: Job): Promise<void> => {
    const { reminderId } = job.data;

    logger.info(`⏰ Processing reminder job: ${reminderId}`);

    // Ensure MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB not connected');
    }

    const reminder = await Reminder.findById(reminderId);
    if (!reminder || !reminder.isActive) {
        logger.info(`⏭️  Reminder ${reminderId} is inactive or deleted, skipping`);
        return;
    }

    // Fetch pet info for the notification message
    const pet = await Pet.findById(reminder.petId);
    const petName = pet?.name || 'your pet';

    // ── Create notification in DB ──────────────────────
    const notification = await Notification.create({
        userId: reminder.userId,
        petId: reminder.petId,
        reminderId: reminder._id,
        type: reminder.type,
        title: `Reminder: ${reminder.type}`,
        message: `It's time for ${petName}'s ${reminder.type}!`,
        isRead: false,
    });

    // ── Emit socket event ──────────────────────────────
    try {
        // Dynamic import to avoid circular dependency at module load
        const { getIO } = await import('@/server/socket');
        const io = getIO();
        io.to(`user:${reminder.userId.toString()}`).emit('notification', {
            id: notification._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            petId: reminder.petId,
            createdAt: notification.createdAt,
        });
        logger.info(`🔔 Socket notification sent to user ${reminder.userId}`);
    } catch {
        // Socket may not be initialised (e.g. in standalone worker mode)
        logger.warn('Socket.io not available, notification stored in DB only');
    }

    // ── Update reminder state ──────────────────────────
    reminder.lastTriggeredAt = new Date();

    if (reminder.repeat !== 'none') {
        const nextDate = getNextScheduledAt(reminder.scheduledAt, reminder.repeat);
        if (nextDate) {
            reminder.scheduledAt = nextDate;

            // Schedule the next job
            const delay = nextDate.getTime() - Date.now();
            await reminderQueue.add(
                'process-reminder',
                { reminderId: reminder._id.toString() },
                { delay: Math.max(0, delay), jobId: `reminder-${reminder._id}-${nextDate.getTime()}` },
            );
            logger.info(`🔁 Next reminder scheduled for ${nextDate.toISOString()}`);
        }
    } else {
        // One-time reminder — deactivate
        reminder.isActive = false;
    }

    await reminder.save();
    logger.info(`✅ Reminder ${reminderId} processed successfully`);
};

// ─── Worker ──────────────────────────────────────────
let workerInitialised = false;

export const initReminderWorker = (): void => {
    if (!REDIS_AVAILABLE) {
        logger.warn('⚠️  Reminder worker skipped — no TCP Redis configured');
        return;
    }
    if (workerInitialised) return;

    const worker = new Worker('reminders', processReminderJob, {
        connection: getRedisConnection(),
        concurrency: 5,
    });

    worker.on('completed', (job) => {
        logger.info(`✅ Reminder job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
        logger.error(`❌ Reminder job ${job?.id} failed: ${err.message}`);
    });

    workerInitialised = true;
    logger.info('⏰ Reminder BullMQ worker initialised');
};

// ─── Schedule a reminder job ─────────────────────────
export const scheduleReminderJob = async (
    reminderId: string,
    scheduledAt: Date,
): Promise<void> => {
    if (!reminderQueue) {
        logger.warn('⚠️  Reminder scheduling skipped — no TCP Redis');
        return;
    }
    const delay = scheduledAt.getTime() - Date.now();

    await reminderQueue.add(
        'process-reminder',
        { reminderId },
        {
            delay: Math.max(0, delay),
            jobId: `reminder-${reminderId}-${scheduledAt.getTime()}`,
        },
    );

    logger.info(`📋 Reminder job queued: ${reminderId} at ${scheduledAt.toISOString()} (delay: ${Math.max(0, delay)}ms)`);
};

// ─── Remove a scheduled job ──────────────────────────
export const removeReminderJob = async (reminderId: string): Promise<void> => {
    if (!reminderQueue) {
        logger.warn('⚠️  Reminder removal skipped — no TCP Redis');
        return;
    }
    const jobs = await reminderQueue.getJobs(['delayed', 'waiting']);
    for (const job of jobs) {
        if (job.data.reminderId === reminderId) {
            await job.remove();
            logger.info(`🗑️  Reminder job removed: ${job.id}`);
        }
    }
};
