"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { api, setTokens, clearTokens, getAccessToken } from "@/lib/api-client";

// ─── Types ──────────────────────────────────────────────
export interface User {
    _id: string;
    phone: string;
    name: string;
    role: string;
    isVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    sendOtp: (phone: string) => Promise<{ otp?: string }>;
    verifyOtp: (phone: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const token = getAccessToken();
        if (token) {
            const stored = localStorage.getItem("pb_user");
            if (stored) {
                try {
                    setUser(JSON.parse(stored));
                } catch {
                    clearTokens();
                }
            }
        }
        setIsLoading(false);
    }, []);

    // Listen for forced logout (from api-client 401)
    useEffect(() => {
        const handler = () => {
            setUser(null);
            clearTokens();
        };
        window.addEventListener("pb:logout", handler);
        return () => window.removeEventListener("pb:logout", handler);
    }, []);

    // Persist user whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem("pb_user", JSON.stringify(user));
        }
    }, [user]);

    const sendOtp = useCallback(async (phone: string) => {
        const result = await api.post<{ phone: string; message: string; otp?: string }>(
            "/auth/send-otp",
            { phone },
        );
        return result;
    }, []);

    const verifyOtp = useCallback(async (phone: string, otp: string) => {
        const result = await api.post<{
            accessToken: string;
            refreshToken: string;
            user: User;
            isNewUser: boolean;
        }>("/auth/verify-otp", { phone, otp });

        setTokens(result.accessToken, result.refreshToken);
        setUser(result.user);
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            // Ignore — we're logging out anyway
        }
        setUser(null);
        clearTokens();
    }, []);

    const updateUser = useCallback((u: User) => setUser(u), []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                sendOtp,
                verifyOtp,
                logout: handleLogout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
