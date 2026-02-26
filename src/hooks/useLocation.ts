"use client";

import { useState, useEffect, useCallback } from "react";

export type LocationStatus =
    | "idle"
    | "requesting"
    | "resolving"
    | "success"
    | "denied"
    | "unavailable"
    | "error";

export interface LocationState {
    status: LocationStatus;
    /** Short label: "Neighbourhood, City" */
    label: string | null;
    /** Single-line full address */
    fullAddress: string | null;
    /** Raw lat/lng */
    coords: { lat: number; lng: number } | null;
    /** Trigger a fresh detection */
    request: () => void;
}

/** Reverse-geocode via BigDataCloud (free, CORS-safe, no API key needed) */
async function reverseGeocode(
    lat: number,
    lng: number
): Promise<{ label: string; fullAddress: string }> {

    // ── PRIMARY: BigDataCloud (browser-friendly, no CORS issues) ─────────────
    try {
        const url =
            `https://api.bigdatacloud.net/data/reverse-geocode-client` +
            `?latitude=${lat}&longitude=${lng}&localityLanguage=en`;

        const res = await fetch(url);
        if (res.ok) {
            const d = await res.json();

            // d.locality  = neighbourhood / suburb / area  (e.g. "Civil Lines")
            // d.city      = city name                      (e.g. "Kanpur")
            // d.principalSubdivision = state               (e.g. "Uttar Pradesh")
            const locality: string = d.locality || d.neighbourhood || "";
            const city: string = d.city || d.county || d.principalSubdivision || "";

            let label: string;
            if (locality && city && locality !== city) {
                label = `${locality}, ${city}`;
            } else if (city) {
                label = city;
            } else if (locality) {
                label = locality;
            } else {
                label = d.countryName || "Your location";
            }

            const fullAddress = [locality, city, d.principalSubdivision, d.countryName]
                .filter(Boolean)
                .join(", ");

            return { label, fullAddress };
        }
    } catch {
        // fall through to backup
    }

    // ── FALLBACK: proxy through our own Next.js API (avoids CORS for Nominatim) ─
    try {
        const res = await fetch(
            `/api/v1/geocode/reverse?lat=${lat}&lng=${lng}`,
        );
        if (res.ok) {
            const d = await res.json();
            return { label: d.data.label, fullAddress: d.data.fullAddress };
        }
    } catch {
        // fall through
    }

    // ── LAST RESORT: show city-level from BigDataCloud second attempt ─────────
    throw new Error("All geocoding methods failed");
}

const STORAGE_KEY = "pb_location_v2";

interface CachedLocation {
    label: string;
    fullAddress: string;
    coords: { lat: number; lng: number };
    ts: number; // timestamp ms
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function useLocation(): LocationState {
    const [status, setStatus] = useState<LocationStatus>("idle");
    const [label, setLabel] = useState<string | null>(null);
    const [fullAddress, setFullAddress] = useState<string | null>(null);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    const detect = useCallback((force = false) => {
        if (!("geolocation" in navigator)) {
            setStatus("unavailable");
            return;
        }

        // Check cache first (skip on forced refresh)
        if (!force) {
            try {
                const raw = sessionStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const cached: CachedLocation = JSON.parse(raw);
                    if (Date.now() - cached.ts < CACHE_TTL_MS) {
                        setLabel(cached.label);
                        setFullAddress(cached.fullAddress);
                        setCoords(cached.coords);
                        setStatus("success");
                        return;
                    }
                }
            } catch {
                // ignore cache errors
            }
        } else {
            // Clear stale cache on manual refresh
            try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
        }

        setStatus("requesting");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setCoords({ lat, lng });
                setStatus("resolving");

                try {
                    const { label: l, fullAddress: fa } = await reverseGeocode(lat, lng);
                    setLabel(l);
                    setFullAddress(fa);
                    setStatus("success");

                    // Cache the result
                    const payload: CachedLocation = {
                        label: l,
                        fullAddress: fa,
                        coords: { lat, lng },
                        ts: Date.now(),
                    };
                    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
                } catch {
                    // All geocoding failed — show a friendly fallback, not raw coords
                    setLabel("Near you");
                    setFullAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                    setStatus("success");
                }
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    setStatus("denied");
                } else {
                    setStatus("error");
                }
            },
            { enableHighAccuracy: false, timeout: 10_000, maximumAge: CACHE_TTL_MS }
        );
    }, []);

    // Auto-detect on first mount
    useEffect(() => {
        detect(false);
    }, [detect]);

    return {
        status,
        label,
        fullAddress,
        coords,
        request: () => detect(true),   // forced refresh when user taps
    };
}
