"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type SectionType =
    | "home"
    | "services"
    | "shop"
    | "cart"
    | "profile"
    | "community"
    | "pets"
    | "rescue"
    | "store"
    | "booking"
    | "product"
    | "notifications"
    | "order-confirmation"
    | "track-order";

interface SectionContextType {
    activeSection: SectionType;
    setActiveSection: (section: SectionType) => void;
    selectedProductId: string | null;
    navigateToProduct: (productId: string) => void;
}

const SectionContext = createContext<SectionContextType | undefined>(undefined);

export function SectionProvider({ children }: { children: ReactNode }) {
    const [activeSection, setActiveSection] = useState<SectionType>("home");
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const navigateToProduct = useCallback((productId: string) => {
        setSelectedProductId(productId);
        setActiveSection("product");
    }, []);

    return (
        <SectionContext.Provider value={{ activeSection, setActiveSection, selectedProductId, navigateToProduct }}>
            {children}
        </SectionContext.Provider>
    );
}

export function useSection() {
    const context = useContext(SectionContext);
    if (!context) {
        throw new Error("useSection must be used within a SectionProvider");
    }
    return context;
}
