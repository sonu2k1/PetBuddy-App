import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Allowed Origins ─────────────────────────────────
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

/**
 * Next.js Edge Middleware — runs before every matched request.
 *
 * Provides:
 * - Security headers (Helmet-equivalent for edge runtime)
 * - CORS with multi-origin support
 * - Request ID injection
 * - Global API rate-limit headers
 */
export function middleware(req: NextRequest) {
    const response = NextResponse.next();

    // ─── Request ID ────────────────────────────────────
    const requestId =
        req.headers.get('x-request-id') || crypto.randomUUID();
    response.headers.set('X-Request-Id', requestId);

    // ═════════════════════════════════════════════════════
    //  SECURITY HEADERS (Helmet equivalent)
    // ═════════════════════════════════════════════════════
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    response.headers.set(
        'Permissions-Policy',
        'camera=(self), microphone=(self), geolocation=(self), payment=()',
    );
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=63072000; includeSubDomains; preload',
    );
    // Content Security Policy
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.tile.openstreetmap.org",
            "connect-src 'self' https://generativelanguage.googleapis.com https://api.bigdatacloud.net https://nominatim.openstreetmap.org",
            "frame-src 'self' https://www.openstreetmap.org",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; '),
    );

    // ═════════════════════════════════════════════════════
    //  CORS (multi-origin support)
    // ═════════════════════════════════════════════════════
    if (req.nextUrl.pathname.startsWith('/api/')) {
        const origin = req.headers.get('origin') || '';
        const isAllowed =
            ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);

        if (isAllowed && origin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
        } else if (ALLOWED_ORIGINS.length === 1) {
            response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
        }

        response.headers.set(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        );
        response.headers.set(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, X-Request-Id',
        );
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Max-Age', '86400'); // 24h preflight cache
        response.headers.set(
            'Access-Control-Expose-Headers',
            'X-Request-Id, X-RateLimit-Remaining, X-RateLimit-Reset',
        );

        // Handle preflight
        if (req.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 204,
                headers: response.headers,
            });
        }
    }

    return response;
}

// Only run on API routes and pages (not static assets)
export const config = {
    matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
