"use client";

import { StoreHeader } from "@/components/store/StoreHeader";
import { CategoryPills } from "@/components/store/CategoryPills";
import { FlashDeliveryBanner } from "@/components/store/FlashDeliveryBanner";
import { PetEssentials } from "@/components/store/PetEssentials";
import { BookAService } from "@/components/store/BookAService";
import { StoreFloatingCart } from "@/components/store/StoreFloatingCart";

export function StoreSection() {
    return (
        <>
            <StoreHeader />

            <main className="pb-36 paw-bg">
                <CategoryPills />
                <FlashDeliveryBanner />
                <PetEssentials />
                <BookAService />
            </main>

            <StoreFloatingCart />
        </>
    );
}
