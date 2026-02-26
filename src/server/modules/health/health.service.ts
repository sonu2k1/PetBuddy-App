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

/**
 * Get all vaccination records for every pet owned by a user.
 * Populates pet name, breed, and imageUrl for display purposes.
 */
export const getUserVaccinations = async (
    userId: string,
    options: { limit?: number } = {},
): Promise<
    Array<{
        _id: string;
        petId: { _id: string; name: string; breed: string; imageUrl: string | null };
        type: string;
        date: Date;
        notes: string;
        documentUrl: string | null;
        createdAt: Date;
    }>
> => {
    const { limit = 50 } = options;

    // Find all pets owned by this user
    const pets = await Pet.find({ ownerId: userId }).select('_id').lean();
    const petIds = pets.map((p) => p._id);

    if (petIds.length === 0) return [];

    const records = await HealthRecord.find({
        petId: { $in: petIds },
        type: 'vaccination',
    })
        .populate('petId', 'name breed imageUrl')
        .sort({ date: -1 })
        .limit(limit)
        .lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return records as any;
};
