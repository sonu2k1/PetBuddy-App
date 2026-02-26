import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { bootstrap } from '@/server/bootstrap';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';

// ─── POST /api/v1/upload — Upload an image file ─────
export async function POST(req: NextRequest) {
    try {
        await bootstrap(); // ensures Cloudinary is configured

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return sendError('No file uploaded', 400);
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            return sendError('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.', 400);
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return sendError('File too large. Maximum size is 5MB.', 400);
        }

        // Convert file to base64 data URI for Cloudinary upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'petbuddy/uploads',
            resource_type: 'image',
        });

        return sendSuccess('File uploaded successfully', { imageUrl: result.secure_url }, 201);
    } catch (error) {
        console.error('Upload error:', error);
        return sendError('Failed to upload file', 500);
    }
}
