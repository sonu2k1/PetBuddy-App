"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api-client";

// ═══════════════════════════════════════════════════════
//  GENERIC SWR-LIKE HOOK
// ═══════════════════════════════════════════════════════
interface UseFetchResult<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
    refetch: () => void;
}

function useFetch<T>(endpoint: string | null, deps: unknown[] = []): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(!!endpoint);
    const [tick, setTick] = useState(0);

    const refetch = useCallback(() => setTick((t) => t + 1), []);

    useEffect(() => {
        if (!endpoint) {
            setData(null);
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);
        setError(null);

        api.get<T>(endpoint)
            .then((result) => {
                if (!cancelled) setData(result);
            })
            .catch((err: ApiError) => {
                if (!cancelled) setError(err.message);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, tick, ...deps]);

    return { data, error, isLoading, refetch };
}

// ═══════════════════════════════════════════════════════
//  PET TYPES
// ═══════════════════════════════════════════════════════
export interface Pet {
    _id: string;
    name: string;
    breed: string;
    gender: "male" | "female";
    dob: string;
    weight: number;
    healthStatus: string;
    imageUrl: string | null;
    qrCodeId: string | null;
    isLostMode: boolean;
    createdAt: string;
}

interface PetsResponse {
    pets: Pet[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function usePets() {
    const { data, error, isLoading, refetch } = useFetch<PetsResponse>("/pets");
    return { pets: data?.pets ?? [], pagination: data?.pagination, error, isLoading, refetch };
}

export function usePet(petId: string | null) {
    return useFetch<Pet>(petId ? `/pets/${petId}` : null);
}

// ═══════════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════════
export interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    discount: number;
    stock: number;
    deliveryTime: string;
    images: string[];
    description: string;
    isActive: boolean;
}

interface ProductsResponse {
    products: Product[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useProducts(category?: string) {
    const qs = category ? `?category=${encodeURIComponent(category)}` : "";
    const { data, error, isLoading, refetch } = useFetch<ProductsResponse>(`/products${qs}`);
    return { products: data?.products ?? [], pagination: data?.pagination, error, isLoading, refetch };
}

// ═══════════════════════════════════════════════════════
//  REMINDERS
// ═══════════════════════════════════════════════════════
export interface Reminder {
    _id: string;
    petId: string;
    type: string;
    scheduledAt: string;
    repeat: "daily" | "weekly" | "monthly" | "none";
    isActive: boolean;
    lastTriggeredAt: string | null;
}

interface RemindersResponse {
    reminders: Reminder[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useReminders(petId?: string) {
    const qs = petId ? `?petId=${petId}` : "";
    const { data, error, isLoading, refetch } = useFetch<RemindersResponse>(`/reminders${qs}`);
    return { reminders: data?.reminders ?? [], error, isLoading, refetch };
}

// ═══════════════════════════════════════════════════════
//  RESCUE REPORTS
// ═══════════════════════════════════════════════════════
export interface RescueReport {
    _id: string;
    reporterId: string;
    location: { type: "Point"; coordinates: [number, number] };
    address: string;
    photoUrl: string;
    description: string;
    status: "pending" | "verified" | "in-progress" | "rescued";
    verified: boolean;
    createdAt: string;
}

interface RescueResponse {
    reports: RescueReport[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useRescueReports() {
    const { data, error, isLoading, refetch } = useFetch<RescueResponse>("/rescue");
    return { reports: data?.reports ?? [], error, isLoading, refetch };
}

// ═══════════════════════════════════════════════════════
//  COMMUNITY POSTS
// ═══════════════════════════════════════════════════════
export interface CommunityPost {
    _id: string;
    authorId: { _id: string; name: string; phone: string } | string;
    content: string;
    imageUrl: string;
    category: string;
    likes: string[];
    comments: { _id: string; userId: string; content: string; createdAt: string }[];
    createdAt: string;
}

interface PostsResponse {
    posts: CommunityPost[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useCommunityPosts(category?: string) {
    const qs = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
    const { data, error, isLoading, refetch } = useFetch<PostsResponse>(`/posts${qs}`);
    return { posts: data?.posts ?? [], error, isLoading, refetch };
}

// ═══════════════════════════════════════════════════════
//  CART
// ═══════════════════════════════════════════════════════
export interface CartItem {
    productId: string;
    name: string;
    price: number;
    discount: number;
    quantity: number;
}

export interface Cart {
    _id: string;
    userId: string;
    items: CartItem[];
    total: number;
}

export function useCart() {
    const { data, error, isLoading, refetch } = useFetch<Cart>("/cart");
    return { cart: data, error, isLoading, refetch };
}

// ═══════════════════════════════════════════════════════
//  SERVICES / BOOKING SLOTS
// ═══════════════════════════════════════════════════════
export interface TimeSlot {
    time: string;
    available: boolean;
}

export interface SlotsResponse {
    date: string;
    slots: TimeSlot[];
}

export function useServiceSlots(serviceId?: string, date?: string) {
    const qs =
        serviceId && date
            ? `?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`
            : null;
    return useFetch<SlotsResponse>(qs ? `/services/slots${qs}` : null);
}

// ═══════════════════════════════════════════════════════
//  MUTATION HELPERS (non-GET)
// ═══════════════════════════════════════════════════════
export { api };
