import Reminder, { IReminder } from './reminder.model';
import Pet from '../pet/pet.model';
import { CreateReminderInput, UpdateReminderInput } from './reminder.schema';
import { scheduleReminderJob, removeReminderJob } from './reminder.worker';
import {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
} from '@/server/utils/AppError';
import { logger } from '@/server/utils/logger';

// ─── Helpers ─────────────────────────────────────────

const verifyPetOwnership = async (petId: string, userId: string) => {
    const pet = await Pet.findById(petId);
    if (!pet) throw new NotFoundError('Pet not found');
    if (pet.ownerId.toString() !== userId) {
        throw new ForbiddenError('You do not own this pet');
    }
    return pet;
};

// ═════════════════════════════════════════════════════
//  SERVICE METHODS
// ═════════════════════════════════════════════════════

/**
 * Create a reminder. Verifies pet ownership first.
 */
export const createReminder = async (
    userId: string,
    data: CreateReminderInput,
): Promise<IReminder> => {
    const pet = await verifyPetOwnership(data.petId, userId);

    const scheduledDate = new Date(data.scheduledAt);

    const reminder = await Reminder.create({
        ...data,
        scheduledAt: scheduledDate,
        userId,
        petId: data.petId,
    });

    // Schedule BullMQ job
    await scheduleReminderJob(reminder._id.toString(), scheduledDate);

    logger.info(`⏰ Reminder created: "${data.type}" for pet "${pet.name}"`);
    return reminder;
};

/**
 * Update a reminder. Only the owner can modify.
 */
export const updateReminder = async (
    reminderId: string,
    userId: string,
    data: UpdateReminderInput,
): Promise<IReminder> => {
    const reminder = await Reminder.findById(reminderId);
    if (!reminder) throw new NotFoundError('Reminder not found');
    if (reminder.userId.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to modify this reminder');
    }

    if (Object.keys(data).length === 0) {
        throw new BadRequestError('At least one field is required for update');
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.scheduledAt) {
        updateData.scheduledAt = new Date(data.scheduledAt);
    }

    const updated = await Reminder.findByIdAndUpdate(
        reminderId,
        { $set: updateData },
        { new: true, runValidators: true },
    );

    if (!updated) throw new NotFoundError('Reminder not found');

    // Re-schedule or remove BullMQ job if relevant fields changed
    if (data.isActive === false) {
        await removeReminderJob(reminderId);
    } else if (data.scheduledAt || data.isActive === true) {
        await removeReminderJob(reminderId);
        if (updated.isActive) {
            await scheduleReminderJob(reminderId, updated.scheduledAt);
        }
    }

    logger.info(`✏️  Reminder updated: ${reminderId}`);
    return updated;
};

/**
 * Get all reminders for the authenticated user.
 * Supports pagination and optional filters.
 */
export const getUserReminders = async (
    userId: string,
    options: { page?: number; limit?: number; isActive?: boolean; petId?: string } = {},
) => {
    const { page = 1, limit = 20, isActive, petId } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId };
    if (isActive !== undefined) filter.isActive = isActive;
    if (petId) filter.petId = petId;

    const [reminders, total] = await Promise.all([
        Reminder.find(filter)
            .populate('petId', 'name breed')
            .sort({ scheduledAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Reminder.countDocuments(filter),
    ]);

    return {
        reminders,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Delete a reminder. Only the owner can delete.
 */
export const deleteReminder = async (
    reminderId: string,
    userId: string,
): Promise<void> => {
    const reminder = await Reminder.findById(reminderId);
    if (!reminder) throw new NotFoundError('Reminder not found');
    if (reminder.userId.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to delete this reminder');
    }

    await removeReminderJob(reminderId);
    await Reminder.findByIdAndDelete(reminderId);
    logger.info(`🗑️  Reminder deleted: ${reminderId}`);
};
