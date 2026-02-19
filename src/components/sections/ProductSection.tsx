"use client";

import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { SubscribeToggle } from "@/components/product/SubscribeToggle";
import { ReviewSummary } from "@/components/product/ReviewSummary";
import { ArrowLeft, Heart, Share2, ShoppingCart } from "lucide-react";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { useSection } from "@/context/SectionContext";

const PRODUCT_IMAGES = [
    "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1589924691195-41432c84c161?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop",
];

export function ProductSection() {
    const { setActiveSection } = useSection();

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                <button onClick={() => setActiveSection("shop")} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <span className="font-bold text-gray-800">Product Details</span>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Heart className="w-6 h-6 text-gray-700" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Share2 className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
            </div>

            <main className="pb-32">
                <ProductGallery images={PRODUCT_IMAGES} />

                <div className="px-4">
                    <ProductInfo />
                    <SubscribeToggle />
                    <QuantitySelector />
                </div>

                <ReviewSummary />
            </main>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 p-4 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)] flex justify-center">
                <div className="w-full max-w-[430px] flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-medium">Total Price</span>
                        <span className="text-2xl font-black text-blue-600">$29.99</span>
                    </div>

                    <button className="flex-1 bg-blue-600 text-white rounded-xl py-3 px-6 font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform hover:bg-blue-700">
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                    </button>
                </div>
            </div>
        </>
    );
}
