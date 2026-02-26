import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { sendSuccess } from '@/server/utils/apiResponse';
import { BadRequestError, NotFoundError } from '@/server/utils/AppError';
import Pet from '@/server/modules/pet/pet.model';
import HealthRecord from '@/server/modules/health/health.model';

type RouteContext = { params: Promise<{ qrCodeId: string }> };

// ─── GET /api/v1/pets/qr/:qrCodeId — Public QR Lookup ─
// No authentication required — anyone with the QR code can view
export const GET = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    logRequest(req);
    await bootstrap();

    const { qrCodeId } = await context.params;

    if (!qrCodeId) {
        throw new BadRequestError('QR Code ID is required');
    }

    // Find pet by QR code ID (public lookup — no owner check)
    const pet = await Pet.findOne({ qrCodeId })
        .populate('ownerId', 'name phone')
        .lean();

    if (!pet) {
        throw new NotFoundError('Pet not found. This QR code may be invalid or expired.');
    }

    // Fetch health records for the pet (public view)
    const records = await HealthRecord.find({ petId: pet._id })
        .sort({ date: -1 })
        .limit(50)
        .lean();

    return sendSuccess('Pet medical profile fetched successfully', {
        pet: {
            _id: pet._id,
            name: pet.name,
            breed: pet.breed,
            gender: pet.gender,
            dob: pet.dob,
            weight: pet.weight,
            healthStatus: pet.healthStatus,
            imageUrl: pet.imageUrl,
            isLostMode: pet.isLostMode,
            owner: pet.ownerId, // populated: { name, phone }
        },
        healthRecords: records.map((r) => ({
            _id: r._id,
            type: r.type,
            date: r.date,
            notes: r.notes,
            documentUrl: r.documentUrl,
        })),
    });
});
