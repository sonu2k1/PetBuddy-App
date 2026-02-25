import { BadRequestError } from '../utils/AppError';

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validates uploaded file from a FormData request.
 * Returns a Buffer and metadata on success.
 *
 * Usage in Route Handler:
 *   const formData = await req.formData();
 *   const file = formData.get('file') as File;
 *   const validated = await validateUpload(file);
 */
export const validateUpload = async (file: File | null) => {
    if (!file) {
        throw new BadRequestError('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new BadRequestError(`Unsupported file type: ${file.type}`);
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    return {
        buffer,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
    };
};
