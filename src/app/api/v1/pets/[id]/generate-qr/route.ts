import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess } from '@/server/utils/apiResponse';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/server/utils/AppError';
import Pet from '@/server/modules/pet/pet.model';
import crypto from 'crypto';

type RouteContext = { params: Promise<{ id: string }> };

// ─── POST /api/v1/pets/:id/generate-qr — Assign / rotate QR code ─
export const POST = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { id: petId } = await context.params;
    if (!petId || petId.length !== 24) {
        throw new BadRequestError('Invalid pet ID');
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
        throw new NotFoundError('Pet not found');
    }
    if (pet.ownerId.toString() !== user.userId) {
        throw new ForbiddenError('You do not have permission to modify this pet');
    }

    // Generate a new unique QR code ID (overwrites existing if any)
    const qrCodeId = crypto.randomUUID();
    pet.qrCodeId = qrCodeId;
    await pet.save();

    return sendSuccess('QR code generated successfully', { qrCodeId });
});
