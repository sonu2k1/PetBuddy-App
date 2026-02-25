import HealthRecord, { IHealthRecord } from './health.model';
import Pet from '../pet/pet.model';
import { CreateHealthRecordInput } from './health.schema';
import {
    NotFoundError,
    ForbiddenError,
} from '@/server/utils/AppError';
import { logger } from '@/server/utils/logger';

// ─── Helpers ─────────────────────────────────────────

/**
 * Verify the pet exists and belongs to the authenticated user.
 * Reused across create, list, and delete operations.
 */
const verifyPetOwnership = async (petId: string, userId: string) => {
    const pet = await Pet.findById(petId);
    if (!pet) {
        throw new NotFoundError('Pet not found');
    }
    if (pet.ownerId.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to access this pet\'s records');
    }
    return pet;
};

// ═════════════════════════════════════════════════════
//  SERVICE METHODS
// ═════════════════════════════════════════════════════

/**
 * Create a health record for a pet.
 * Only the pet owner can add records.
 */
export const createHealthRecord = async (
    petId: string,
    userId: string,
    data: CreateHealthRecordInput,
): Promise<IHealthRecord> => {
    await verifyPetOwnership(petId, userId);

    const record = await HealthRecord.create({
        ...data,
        date: new Date(data.date),
        petId,
    });

    logger.info(`🩺 Health record created: ${data.type} for pet ${petId}`);
    return record;
};

/**
 * Get all health records for a pet.
 * Only the pet owner can view records.
 * Supports pagination and optional type filtering.
 */
export const getHealthRecords = async (
    petId: string,
    userId: string,
    options: { page?: number; limit?: number; type?: string } = {},
) => {
    await verifyPetOwnership(petId, userId);

    const { page = 1, limit = 20, type } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { petId };
    if (type && ['vaccination', 'weight', 'treatment'].includes(type)) {
        filter.type = type;
    }

    const [records, total] = await Promise.all([
        HealthRecord.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        HealthRecord.countDocuments(filter),
    ]);

    return {
        records,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Delete a health record.
 * Verifies pet ownership before deletion.
 */
export const deleteHealthRecord = async (
    recordId: string,
    userId: string,
): Promise<void> => {
    const record = await HealthRecord.findById(recordId);
    if (!record) {
        throw new NotFoundError('Health record not found');
    }

    // Verify ownership through the pet
    await verifyPetOwnership(record.petId.toString(), userId);

    await HealthRecord.findByIdAndDelete(recordId);
    logger.info(`🗑️  Health record deleted: ${recordId}`);
};
