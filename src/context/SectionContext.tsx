"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
    | "notifications";

interface SectionContextType {
    activeSection: SectionType;
    setActiveSection: (section: SectionType) => void;
}

const SectionContext = createContext<SectionContextType | undefined>(undefined);

export function SectionProvider({ children }: { children: ReactNode }) {
    const [activeSection, setActiveSection] = useState<SectionType>("home");

    return (
        <SectionContext.Provider value={{ activeSection, setActiveSection }}>
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
