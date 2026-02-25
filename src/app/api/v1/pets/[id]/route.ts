import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { updatePetSchema } from '@/server/modules/pet/pet.schema';
import { getPetById, updatePet, deletePet } from '@/server/modules/pet/pet.service';
import { BadRequestError } from '@/server/utils/AppError';
import { ZodError } from 'zod';

// ─── Helper to extract pet ID from params ────────────
type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/v1/pets/:id — Get single pet ──────────
export const GET = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    // Auth required to view pet details
    authenticate(req);

    const { id } = await context.params;
    if (!id || id.length !== 24) {
        throw new BadRequestError('Invalid pet ID');
    }

    const pet = await getPetById(id);

    return sendSuccess('Pet fetched successfully', pet);
});

// ─── PATCH /api/v1/pets/:id — Update pet ─────────────
export const PATCH = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { id } = await context.params;
    if (!id || id.length !== 24) {
        throw new BadRequestError('Invalid pet ID');
    }

    const body = await req.json();

    let validated;
    try {
        validated = updatePetSchema.parse(body);
    } catch (error) {
        if (error instanceof ZodError) {
            return sendError(
                'Validation failed',
                400,
                error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
            );
        }
        throw error;
    }

    // Check at least one field is being updated
    if (Object.keys(validated).length === 0) {
        throw new BadRequestError('At least one field is required for update');
    }

    const updated = await updatePet(id, user.userId, validated);

    return sendSuccess('Pet updated successfully', updated);
});

// ─── DELETE /api/v1/pets/:id — Delete pet ────────────
export const DELETE = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { id } = await context.params;
    if (!id || id.length !== 24) {
        throw new BadRequestError('Invalid pet ID');
    }

    await deletePet(id, user.userId);

    return sendSuccess('Pet deleted successfully', null);
});
