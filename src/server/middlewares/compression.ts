import { NextRequest } from 'next/server';

/**
 * Response compression utility for Next.js Route Handlers.
 *
 * NOTE: Next.js automatically handles gzip/brotli compression in production
 * via its built-in server. This utility provides manual compression for
 * large JSON payloads where you want explicit control.
 *
 * Usage:
 *   return compressResponse(req, data, 200);
 */

/**
 * Check if the client accepts a given encoding.
 */
const acceptsEncoding = (req: NextRequest, encoding: string): boolean => {
    const accept = req.headers.get('accept-encoding') || '';
    return accept.toLowerCase().includes(encoding);
};

/**
 * Compress a JSON response if the client supports it and the payload
 * exceeds the size threshold.
 *
 * Falls back to regular JSON response for small payloads or when
 * compression is not supported.
 */
export const compressResponse = async (
    req: NextRequest,
    body: Record<string, unknown>,
    status = 200,
    headers: Record<string, string> = {},
): Promise<Response> => {
    const jsonString = JSON.stringify(body);
    const sizeBytes = new TextEncoder().encode(jsonString).length;

    // Only compress if > 1KB
    const THRESHOLD = 1024;

    if (sizeBytes > THRESHOLD && acceptsEncoding(req, 'gzip')) {
        // Use CompressionStream (available in Edge/Node 18+)
        const stream = new Blob([jsonString])
            .stream()
            .pipeThrough(new CompressionStream('gzip'));

        const compressedBuffer = await new Response(stream).arrayBuffer();

        return new Response(compressedBuffer, {
            status,
            headers: {
                'Content-Type': 'application/json',
                'Content-Encoding': 'gzip',
                'Vary': 'Accept-Encoding',
                'X-Original-Size': String(sizeBytes),
                'X-Compressed-Size': String(compressedBuffer.byteLength),
                ...headers,
            },
        });
    }

    // No compression — return plain JSON
    return new Response(jsonString, {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
};
