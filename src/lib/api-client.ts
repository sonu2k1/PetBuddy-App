/**
 * ═══════════════════════════════════════════════════════
 *  API CLIENT — centralised HTTP layer for PetBuddy
 * ═══════════════════════════════════════════════════════
 *
 * • Automatically attaches JWT access tokens
 * • Handles 401 → silent token refresh → retry
 * • Normalises every response to { success, data, message }
 */

const BASE = '/api/v1';

// ─── Token Storage ──────────────────────────────────────
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
    accessToken = access;
    refreshToken = refresh;
    if (typeof window !== 'undefined') {
        localStorage.setItem('pb_access', access);
        localStorage.setItem('pb_refresh', refresh);
    }
};

export const getAccessToken = () => {
    if (!accessToken && typeof window !== 'undefined') {
        accessToken = localStorage.getItem('pb_access');
    }
    return accessToken;
};

export const getRefreshToken = () => {
    if (!refreshToken && typeof window !== 'undefined') {
        refreshToken = localStorage.getItem('pb_refresh');
    }
    return refreshToken;
};

export const clearTokens = () => {
    accessToken = null;
    refreshToken = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem('pb_access');
        localStorage.removeItem('pb_refresh');
        localStorage.removeItem('pb_user');
    }
};

// ─── Types ──────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown;
}

export class ApiError extends Error {
    status: number;
    errors?: unknown;

    constructor(message: string, status: number, errors?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

// ─── Refresh Logic ──────────────────────────────────────
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
    const rt = getRefreshToken();
    if (!rt) return false;

    try {
        const res = await fetch(`${BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: rt }),
        });

        if (!res.ok) {
            clearTokens();
            return false;
        }

        const json: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();

        if (json.success && json.data) {
            setTokens(json.data.accessToken, json.data.refreshToken);
            return true;
        }

        clearTokens();
        return false;
    } catch {
        clearTokens();
        return false;
    }
}

// ─── Core Request Function ──────────────────────────────
async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true,
): Promise<T> {
    const token = getAccessToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}${endpoint}`, {
        ...options,
        headers,
    });

    // ── Handle 401 — try refresh once ───────────────────
    if (res.status === 401 && retry) {
        // Deduplicate concurrent refresh calls
        if (!refreshPromise) {
            refreshPromise = refreshAccessToken().finally(() => {
                refreshPromise = null;
            });
        }

        const refreshed = await refreshPromise;
        if (refreshed) {
            return request<T>(endpoint, options, false);
        }

        clearTokens();
        // Dispatch a custom event so AuthContext can react
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('pb:logout'));
        }
        throw new ApiError('Session expired', 401);
    }

    const json: ApiResponse<T> = await res.json();

    if (!res.ok || !json.success) {
        throw new ApiError(json.message || 'Something went wrong', res.status, json.errors);
    }

    return json.data as T;
}

// ─── Public API Methods ─────────────────────────────────
export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    put: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    patch: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
