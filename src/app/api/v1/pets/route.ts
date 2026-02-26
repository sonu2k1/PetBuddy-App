import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { authenticate } from '@/server/middlewares/auth';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';
import { createPetSchema } from '@/server/modules/pet/pet.schema';
import { createPet, getUserPets } from '@/server/modules/pet/pet.service';
import { ZodError } from 'zod';

// ─── POST /api/v1/pets — Create a pet ────────────────
export const POST = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const contentType = req.headers.get('content-type') || '';
    let body: Record<string, unknown>;

    if (contentType.includes('multipart/form-data')) {
        // FormData with optional image
        const formData = await req.formData();
        body = {
            name: formData.get('name') as string,
            breed: formData.get('breed') as string,
            gender: formData.get('gender') as string,
            dob: formData.get('dob') as string,
            weight: parseFloat(formData.get('weight') as string),
            healthStatus: (formData.get('healthStatus') as string) || 'healthy',
        };

        const imageFile = formData.get('image') as File | null;
        if (imageFile && imageFile.size > 0) {
            // Upload image to Cloudinary (Vercel has read-only filesystem)
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString('base64');
            const dataUri = `data:${imageFile.type};base64,${base64}`;

            try {
                const result = await cloudinary.uploader.upload(dataUri, {
                    folder: 'petbuddy/pets',
                    resource_type: 'image',
                });
                body.imageUrl = result.secure_url;
            } catch (uploadErr) {
                console.error('Pet image upload failed:', uploadErr);
                // Continue without image rather than failing the whole request
            }
        }
    } else {
        body = await req.json();
    }

    // Clean up optional fields — remove falsy imageUrl so Zod skips it
    if (!body.imageUrl) {
        delete body.imageUrl;
    }

    let validated;
    try {
        validated = createPetSchema.parse(body);
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

    const pet = await createPet(user.userId, validated);

    return sendSuccess('Pet created successfully', pet, 201);
});

// ─── GET /api/v1/pets — List user's pets ─────────────
export const GET = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    const user = authenticate(req);

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const result = await getUserPets(user.userId, page, limit);

    return sendSuccess('Pets fetched successfully', result);
});
