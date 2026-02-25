import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { sendSuccess, sendError } from '@/server/utils/apiResponse';

// ─── POST /api/v1/upload — Upload an image file ─────
export async function POST(req: NextRequest) {
    try {
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

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'jpg';
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Write file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(uploadsDir, uniqueName);
        await writeFile(filePath, buffer);

        // Return the public URL
        const imageUrl = `/uploads/${uniqueName}`;

        return sendSuccess('File uploaded successfully', { imageUrl }, 201);
    } catch (error) {
        console.error('Upload error:', error);
        return sendError('Failed to upload file', 500);
    }
}
