import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/v1/geocode/reverse?lat=XX&lng=YY
 *
 * Server-side proxy for Nominatim reverse geocoding.
 * Runs on the server so CORS / User-Agent restrictions don't apply.
 * Used as fallback if the client-side BigDataCloud call fails.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const lat = searchParams.get("lat");
    // Accept both 'lng' (our standard) and 'lon' (OpenStreetMap convention)
    const lng = searchParams.get("lng") ?? searchParams.get("lon");

    if (!lat || !lng) {
        return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);

    if (isNaN(latN) || isNaN(lngN)) {
        return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    try {
        const url =
            `https://nominatim.openstreetmap.org/reverse` +
            `?format=jsonv2&lat=${latN}&lon=${lngN}&addressdetails=1&accept-language=en&zoom=16`;

        const res = await fetch(url, {
            headers: {
                "User-Agent": "PetBuddy-App/1.0 (server-proxy)",
                Accept: "application/json",
            },
            next: { revalidate: 0 },
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Geocoding API failed" }, { status: 502 });
        }

        const data = await res.json();
        const a = (data.address ?? {}) as Record<string, string>;

        const area =
            a.neighbourhood || a.suburb || a.city_district ||
            a.quarter || a.borough || a.village || a.hamlet ||
            a.town || a.road || "";

        const city =
            a.city || a.town || a.municipality ||
            a.county || a.state_district || a.state || "";

        let label: string;
        if (area && city && area !== city) {
            label = `${area}, ${city}`;
        } else if (city) {
            label = city;
        } else if (area) {
            label = area;
        } else {
            const parts = (data.display_name as string)
                ?.split(",")
                .map((p: string) => p.trim())
                .filter(Boolean) ?? [];
            label = parts.slice(0, 2).join(", ") || "Your location";
        }

        const fullAddress = (data.display_name as string) ?? label;

        return NextResponse.json({
            data: { label, fullAddress },
        });
    } catch (err) {
        console.error("[geocode/reverse]", err);
        return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
    }
}
