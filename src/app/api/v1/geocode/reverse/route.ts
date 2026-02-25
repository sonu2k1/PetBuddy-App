import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/geocode/reverse?lat=...&lon=...
 * 
 * Server-side proxy for OpenStreetMap Nominatim reverse geocoding.
 * This avoids CORS issues since the request is made server-to-server.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
        return NextResponse.json(
            { error: 'lat and lon query parameters are required' },
            { status: 400 }
        );
    }

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'PetBuddyApp/1.0 (petbuddy-rescue-geocoding)',
                    'Accept-Language': 'en',
                },
                next: { revalidate: 300 }, // Cache for 5 minutes
            }
        );

        if (!res.ok) {
            return NextResponse.json(
                { error: `Nominatim returned ${res.status}` },
                { status: 502 }
            );
        }

        const data = await res.json();

        return NextResponse.json({
            display_name: data.display_name || null,
            address: data.address || null,
            lat: data.lat,
            lon: data.lon,
        });
    } catch (error) {
        console.error('[Geocode Proxy] Error:', error);
        return NextResponse.json(
            { error: 'Failed to reverse geocode' },
            { status: 500 }
        );
    }
}
