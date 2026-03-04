"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useProduct, useCart, api, type Product } from "@/hooks/useData";
import { useSection } from "@/context/SectionContext";
import {
    ArrowLeft,
    Share2,
    Minus,
    Plus,
    Loader2,
    Truck,
    ShieldCheck,
    RotateCcw,
    Star,
    Zap,
    Heart,
    ShoppingCart,
} from "lucide-react";



// Extended product descriptions for the detail view
const PRODUCT_DETAILS: Record<string, { longDescription: string; features: string[] }> = {
    "1": {
        longDescription: "Formulated with high-quality protein and essential nutrients, our Premium Adult Chicken & Rice is designed to support healthy growth and development in young dogs of all breeds.",
        features: [
            "Rich in DHA for brain & eye development",
            "Balanced Calcium and Phosphorus for strong bones",
            "Antioxidants for a healthy immune system",
            "Easy-to-digest formula for small stomachs",
        ],
    },
    "2": {
        longDescription: "Built to withstand even the most aggressive chewers, this durable rubber chew toy provides hours of entertainment while promoting healthy dental habits.",
        features: [
            "Made from 100% natural rubber",
            "Helps clean teeth and massage gums",
            "Bounces unpredictably for fun fetch games",
            "Suitable for medium to large breed dogs",
        ],
    },
    "3": {
        longDescription: "These irresistible salmon-flavored cat treats are made with real fish and packed with omega fatty acids for a healthy, shiny coat.",
        features: [
            "Real salmon as the #1 ingredient",
            "Rich in Omega-3 and Omega-6 fatty acids",
            "Grain-free and no artificial preservatives",
            "Crunchy texture helps clean teeth",
        ],
    },
    "4": {
        longDescription: "Our gentle oatmeal shampoo is perfect for pets with sensitive or dry skin. The natural oatmeal formula soothes irritation while leaving your pet's coat soft and shiny.",
        features: [
            "Colloidal oatmeal soothes itchy skin",
            "Aloe vera for deep moisturizing",
            "pH balanced for pets",
            "Paraben-free and cruelty-free",
        ],
    },
    "5": {
        longDescription: "Pedigree Dentastix are scientifically proven to reduce tartar buildup. Their unique X-shape and special texture clean down to the gum line when chewed daily.",
        features: [
            "Clinically proven to reduce tartar by up to 80%",
            "Unique X-shape cleans hard-to-reach areas",
            "Low in fat with no added sugar",
            "Helps freshen breath naturally",
        ],
    },
    "6": {
        longDescription: "This adjustable pet harness is designed for comfort and control. The breathable mesh material keeps your pet cool during walks, while the reflective strips ensure visibility at night.",
        features: [
            "Adjustable chest and neck straps",
            "Breathable air mesh material",
            "Reflective strips for night visibility",
            "Strong D-ring leash attachment point",
        ],
    },
};

// Mock reviews
const MOCK_REVIEWS = [
    { name: "Priya S.", rating: 5, text: "My lab loves it!", time: "2 days ago" },
    { name: "Rahul M.", rating: 4, text: "Great quality.", time: "1 week ago" },
    { name: "Anita K.", rating: 5, text: "Best product ever! Highly recommend.", time: "3 days ago" },
];

// ═══════════════════════════════════════════════════════
//  IMAGE GALLERY – soft pink/beige background
// ═══════════════════════════════════════════════════════
function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const galleryImages = images.length >= 3 ? images : [...images, ...images, ...images].slice(0, 3);

    return (
        <div className="relative w-full">
            {/* Soft pink/beige gradient background matching Figma */}
            <div
                style={{
                    background: "linear-gradient(180deg, #fdf2f0 0%, #fce8e4 40%, #f8f4f1 100%)",
                    borderRadius: "0 0 2rem 2rem",
                }}
                className="w-full"
            >
                <div className="aspect-[4/3] flex items-center justify-center p-6">
                    <img
                        src={galleryImages[activeIndex]}
                        alt={productName}
                        className="w-full h-full object-contain drop-shadow-lg animate-in fade-in duration-500"
                        style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.10))" }}
                    />
                </div>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 py-3 bg-white">
                {galleryImages.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={cn(
                            "rounded-full transition-all duration-300",
                            activeIndex === idx
                                ? "w-6 h-2 bg-[#2d8c6f]"
                                : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
//  FEATURE BADGES – solid dark teal circles w/ white icons
// ═══════════════════════════════════════════════════════
function FeatureBadges() {
    const badges = [
        { icon: Truck, label: "FREE SHIPPING" },
        { icon: ShieldCheck, label: "100% GENUINE" },
        { icon: RotateCcw, label: "EASY RETURNS" },
    ];

    return (
        <div className="px-4 py-3">
            <div
                className="rounded-4xl py-5 px-2"
                style={{
                    background: "linear-gradient(135deg, #aff6daff 0%, #daf9efff 60%, #58f7c5ff 100%)",
                    // background: "#d6e6d8ff",
                    border: "1px solid #d5f5c8ff",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                }}
            >
                <div className="flex justify-around">
                    {badges.map((badge) => (
                        <div key={badge.label} className="flex flex-col items-center gap-2">
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{
                                    background: "linear-gradient(145deg, #1abb8bff 0%, #73f1c9ff 100%)",
                                    boxShadow: "0 4px 12px rgba(45,140,111,0.25)",
                                }}
                            >
                                <badge.icon className="w-5 h-5 text-white" strokeWidth={2} />
                            </div>
                            <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase">
                                {badge.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
//  PURPOSE BANNER – pink/rose card with heart icon
// ═══════════════════════════════════════════════════════
function PurposeBanner() {
    return (
        <div className="mx-4 my-2">
            <div
                className="relative rounded-4xl overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #f6dfe6ff 0%, #f9dae2ff 60%, #f9b8c8ff 100%)",
                }}
            >
                {/* Decorative circles */}
                <div
                    className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full pointer-events-none"
                    style={{ background: "rgba(255,255,255,0.20)" }}
                />
                <div
                    className="absolute right-12 -top-3 w-16 h-16 rounded-full pointer-events-none"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                />

                <div className="relative z-10 p-4 flex items-center gap-3">
                    {/* Heart icon – soft pink rounded square */}
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                            background: "linear-gradient(135deg, #e84393 0%, #f06292 100%)",
                            boxShadow: "0 4px 12px rgba(232,67,147,0.25)",
                        }}
                    >
                        <Heart className="w-5 h-5 text-white fill-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
                            Your Purchase Has A Purpose
                        </h4>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                            Every bag sold helps feed a shelter puppy for a full day. Join our mission!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
//  CUSTOMER REVIEWS – bordered card w/ 4.8★ header
// ═══════════════════════════════════════════════════════
function CustomerReviews() {
    return (
        <div className="mx-4 my-4">
            <div
                className="rounded-2xl p-4"
                style={{
                    background: "#ffffff",
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                }}
            >
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">Customer Reviews</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-[#F05359]">4.8</span>
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                </div>

                {/* Review cards horizontal scroll */}
                <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1">
                    {MOCK_REVIEWS.map((review, idx) => (
                        <div
                            key={idx}
                            className="min-w-[150px] rounded-xl p-3 shrink-0"
                            style={{
                                background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
                            }}
                        >
                            {/* Stars */}
                            <div className="flex gap-0.5 mb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "w-3 h-3",
                                            i < review.rating
                                                ? "text-amber-400 fill-amber-400"
                                                : "text-gray-200 fill-gray-200"
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-[11px] text-gray-600 italic leading-snug">
                                &ldquo;{review.text}&rdquo;
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
//  MAIN PRODUCT SECTION
// ═══════════════════════════════════════════════════════
export function ProductSection() {
    const { setActiveSection, selectedProductId } = useSection();
    const { product: apiProduct, isLoading: isProductLoading } = useProduct(selectedProductId);
    const { cart, refetch: refetchCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isUpdating, setIsUpdating] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    const product: Product | null | undefined = apiProduct;

    // Calculate prices
    const effectivePrice = product ? Math.round(product.price * (1 - product.discount / 100)) : 0;
    const details = product ? PRODUCT_DETAILS[product._id] : undefined;

    // Cart quantity for this product
    const cartQty = useMemo(() => {
        if (!cart?.items || !product) return 0;
        const item = cart.items.find((i) => i.productId === product._id);
        return item?.quantity || 0;
    }, [cart, product]);

    // ─── Cart Actions ────────────────────────────────────
    const addToCart = useCallback(async () => {
        if (!product) return;
        setIsUpdating(true);
        setAddError(null);

        try {
            const currentItems = cart?.items || [];
            const existingItems = currentItems
                .filter((item) => item.productId !== product._id)
                .map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                }));

            const newQty = cartQty + quantity;
            const allItems = [
                ...existingItems,
                { productId: product._id, quantity: newQty },
            ];

            await api.post("/cart", { items: allItems });
            refetchCart();
            // Navigate to checkout only on success
            setActiveSection("cart");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to add to cart";
            setAddError(message);
        } finally {
            setIsUpdating(false);
        }
    }, [cart, product, quantity, cartQty, setActiveSection, refetchCart]);

    const decrease = () => setQuantity((q) => Math.max(1, q - 1));
    const increase = () => setQuantity((q) => Math.min(10, q + 1));

    // Show loading while product is being fetched
    if (isProductLoading && !apiProduct) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#F05359] animate-spin" />
                <p className="text-sm text-gray-400 font-medium">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 p-4">
                <p className="text-lg text-gray-600 font-bold">Product Not Found</p>
                <button
                    onClick={() => setActiveSection("store")}
                    className="mt-4 bg-[#F05359] text-white px-6 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                >
                    Back to Store
                </button>
            </div>
        );
    }

    return (
        <>
            {/* ── Sticky Header ─────────────────────────────────── */}
            <div
                className="sticky top-0 z-50 px-3 py-2.5 flex items-center justify-between"
                style={{
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                }}
            >
                <button
                    onClick={() => setActiveSection("store")}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors active:scale-90"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>

                <div className="flex items-center gap-1.5">
                    <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                            background: "linear-gradient(135deg, #F05359 0%, #ff6b72 100%)",
                        }}
                    >
                        <span className="text-white text-xs">🐾</span>
                    </div>
                    <span className="font-bold text-gray-800 text-sm tracking-tight">PetBuddy Central</span>
                </div>

                <button
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors active:scale-90"
                >
                    <Share2 className="w-5 h-5 text-gray-700" />
                </button>
            </div>

            {/* ── Scrollable Content ─────────────────────────────── */}
            <main
                className="pb-28"
                style={{ background: "linear-gradient(180deg, #ffffff 0%, #fefefe 100%)" }}
            >
                {/* Product Image Gallery */}
                <ImageGallery images={product.images} productName={product.name} />

                {/* ── Product Info Section ───────────────────────── */}
                <div className="px-5 pt-4 pb-2">
                    {/* Product Name */}
                    <h1
                        className="text-xl leading-tight text-gray-900"
                        style={{ fontWeight: 800, letterSpacing: "-0.01em" }}
                    >
                        {product.name}
                    </h1>

                    {/* Delivery badge – green pill */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                        <div
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                            style={{
                                background: "linear-gradient(135deg, #e6f7f1 0%, #d1f0e4 100%)",
                            }}
                        >
                            <Zap className="w-3 h-3 text-[#2d8c6f]" strokeWidth={2.5} />
                            <span className="text-[11px] font-bold text-[#2d8c6f]">
                                15 min delivery
                            </span>
                        </div>
                    </div>

                    {/* Price row */}
                    <div className="flex items-baseline gap-2.5 mt-3">
                        <span
                            className="text-2xl"
                            style={{ fontWeight: 900, color: "#e84393" }}
                        >
                            ₹{effectivePrice}
                        </span>
                        {product.discount > 0 && (
                            <>
                                <span
                                    className="text-sm line-through"
                                    style={{ color: "#c9a0b0" }}
                                >
                                    ₹{product.price}
                                </span>
                                <span
                                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                        background: "linear-gradient(135deg, #fce4ec 0%, #f8d1dc 100%)",
                                        color: "#e84393",
                                    }}
                                >
                                    {product.discount}% OFF
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Feature Badges */}
                <FeatureBadges />

                {/* Purpose Banner */}
                <PurposeBanner />

                {/* ── Thin divider ───────────────────────────────── */}
                <div className="mx-4 my-3">
                    <div className="h-[1px] bg-gray-100" />
                </div>

                {/* Product Description */}
                <div className="px-5 py-3">
                    <h3
                        className="text-base text-gray-900 mb-3"
                        style={{ fontWeight: 700 }}
                    >
                        Product Description
                    </h3>
                    <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                        {details?.longDescription || product.description}
                    </p>

                    {details?.features && (
                        <ul className="space-y-2.5">
                            {details.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2.5">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                        style={{ background: "#1a1a1a" }}
                                    />
                                    <span className="text-[13px] text-gray-700 leading-snug">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* ── Thin divider ───────────────────────────────── */}
                <div className="mx-4 my-2">
                    <div className="h-[1px] bg-gray-100" />
                </div>

                {/* Customer Reviews */}
                <CustomerReviews />

                {/* Stock warning */}
                {product.stock > 0 && product.stock <= 10 && (
                    <div className="px-5 pb-4 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-xs font-semibold text-orange-600">
                            Only {product.stock} left in stock — order soon!
                        </span>
                    </div>
                )}
            </main>

            {/* ── Error Toast ─────────────────────────────────── */}
            {addError && (
                <div className="fixed top-14 left-4 right-4 max-w-[400px] mx-auto z-[60] bg-red-50 border border-red-200 rounded-2xl p-3 flex items-start gap-2 shadow-lg animate-slide-up">
                    <span className="text-red-500 text-sm">⚠️</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-red-700">Could not add to cart</p>
                        <p className="text-[11px] text-red-600 mt-0.5">{addError}</p>
                    </div>
                    <button onClick={() => setAddError(null)} className="text-red-400 text-xs font-bold">
                        ✕
                    </button>
                </div>
            )}

            {/* ── Sticky Bottom Bar ─────────────────────────────── */}
            <div
                className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
                style={{
                    background: "rgba(255,255,255,0.97)",
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                }}
            >
                <div className="w-full max-w-[430px] px-4 py-3 flex items-center gap-3">
                    {/* Quantity Selector */}
                    <div
                        className="flex items-center rounded-full"
                        style={{ background: "#f5f5f5" }}
                    >
                        <button
                            onClick={decrease}
                            disabled={quantity <= 1}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-black active:scale-90 transition-all disabled:opacity-40"
                        >
                            <Minus className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <span
                            className="w-7 text-center text-sm text-gray-900"
                            style={{ fontWeight: 800 }}
                        >
                            {quantity}
                        </span>
                        <button
                            onClick={increase}
                            disabled={quantity >= 10}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-black active:scale-90 transition-all disabled:opacity-40"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={addToCart}
                        disabled={isUpdating || product.stock === 0}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm transition-all active:scale-[0.97]",
                            product.stock === 0
                                ? "cursor-not-allowed"
                                : ""
                        )}
                        style={
                            product.stock === 0
                                ? {
                                    background: "#d1d5db",
                                    color: "#6b7280",
                                }
                                : {
                                    background: "linear-gradient(135deg, #F05359 0%, #FF7B8A 100%)",
                                    color: "#ffffff",
                                    fontWeight: 700,
                                    boxShadow: "0 4px 16px rgba(240,83,89,0.30)",
                                }
                        }
                    >
                        {isUpdating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : product.stock === 0 ? (
                            "Out of Stock"
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                                {cartQty > 0 && (
                                    <span
                                        className="text-[10px] px-1.5 py-0.5 rounded-full ml-1"
                                        style={{
                                            background: "rgba(255,255,255,0.20)",
                                            color: "#ffffff",
                                            fontWeight: 800,
                                        }}
                                    >
                                        {cartQty} in cart
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
