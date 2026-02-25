import Pet, { IPet } from './pet.model';
import { CreatePetInput, UpdatePetInput } from './pet.schema';
import {
    NotFoundError,
    ForbiddenError,
} from '@/server/utils/AppError';
import { logger } from '@/server/utils/logger';

// ─── Helpers ─────────────────────────────────────────

/**
 * Fetch a pet and verify the requester is the owner.
 * Throws NotFoundError or ForbiddenError.
 */
const findPetAndVerifyOwner = async (
    petId: string,
    userId: string,
): Promise<IPet> => {
    const pet = await Pet.findById(petId);
    if (!pet) {
        throw new NotFoundError('Pet not found');
    }
    if (pet.ownerId.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to modify this pet');
    }
    return pet;
};

// ═════════════════════════════════════════════════════
//  SERVICE METHODS
// ═════════════════════════════════════════════════════

/**
 * Create a new pet for the authenticated user.
 */
export const createPet = async (
    userId: string,
    data: CreatePetInput,
): Promise<IPet> => {
    const pet = await Pet.create({
        ...data,
        dob: new Date(data.dob),
        ownerId: userId,
    });

    logger.info(`🐾 Pet created: "${pet.name}" for user ${userId}`);
    return pet;
};

/**
 * Get all pets belonging to the authenticated user.
 * Supports pagination via page & limit query params.
 */
export const getUserPets = async (
    userId: string,
    page = 1,
    limit = 20,
) => {
    const skip = (page - 1) * limit;

    const [pets, total] = await Promise.all([
        Pet.find({ ownerId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Pet.countDocuments({ ownerId: userId }),
    ]);

    return {
        pets,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get a single pet by ID.
 * Any authenticated user can view a pet (e.g. for lost-mode public view).
 */
export const getPetById = async (petId: string): Promise<IPet> => {
    const pet = await Pet.findById(petId).populate('ownerId', 'name phone');
    if (!pet) {
        throw new NotFoundError('Pet not found');
    }
    return pet;
};

/**
 * Update a pet. Only the owner can update.
 */
export const updatePet = async (
    petId: string,
    userId: string,
    data: UpdatePetInput,
): Promise<IPet> => {
    await findPetAndVerifyOwner(petId, userId);

    const updateData: Record<string, unknown> = { ...data };
    if (data.dob) {
        updateData.dob = new Date(data.dob);
    }

    const updated = await Pet.findByIdAndUpdate(
        petId,
        { $set: updateData },
        { new: true, runValidators: true },
    );

    if (!updated) {
        throw new NotFoundError('Pet not found');
    }

    logger.info(`✏️  Pet updated: "${updated.name}" (${petId})`);
    return updated;
};

/**
 * Delete a pet. Only the owner can delete.
 */
export const deletePet = async (
    petId: string,
    userId: string,
): Promise<void> => {
    const pet = await findPetAndVerifyOwner(petId, userId);

    await Pet.findByIdAndDelete(petId);
    logger.info(`🗑️  Pet deleted: "${pet.name}" (${petId})`);
};
