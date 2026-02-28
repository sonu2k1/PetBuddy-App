"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useProducts, useCart, api, type Product, type Cart } from "@/hooks/useData";
import { Loader2, Plus, Minus, ChevronRight, ShoppingBag, Search, Heart } from "lucide-react";
import { useSection } from "@/context/SectionContext";

// ═══════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════
const CATEGORIES = [
    { id: "all", label: "All", emoji: "🐾" },
    { id: "food", label: "Food", emoji: "🍖" },
    { id: "grooming", label: "Grooming", emoji: "✂️" },
    { id: "toys", label: "Toys", emoji: "🎾" },
    { id: "health", label: "Health", emoji: "💊" },
    { id: "gear", label: "Gear", emoji: "🎒" },
];

const FALLBACK_PRODUCTS: Product[] = [
    {
        _id: "1",
        name: "Premium Adult Chicken & Rice",
        category: "food",
        price: 489,
        discount: 12,
        stock: 2,
        deliveryTime: "Today, 15m",
        images: ["https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=300&h=300&fit=crop"],
        description: "High-quality adult dog food with real chicken",
        isActive: true,
    },
    {
        _id: "2",
        name: "Durable Rubber Chew Toy",
        category: "toys",
        price: 650,
        discount: 0,
        stock: 0,
        deliveryTime: "Today, 30m",
        images: ["https://images.unsplash.com/photo-1615266895738-11f1371cd7e5?w=300&h=300&fit=crop"],
        description: "Tough chew toy for aggressive chewers",
        isActive: true,
    },
    {
        _id: "3",
        name: "Savory Salmon Cat Treats",
        category: "food",
        price: 185,
        discount: 15,
        stock: 45,
        deliveryTime: "Today, 20m",
        images: ["https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=300&h=300&fit=crop"],
        description: "Premium salmon-flavored cat treats",
        isActive: true,
    },
    {
        _id: "4",
        name: "Oatmeal Pet Shampoo",
        category: "grooming",
        price: 245,
        discount: 10,
        stock: 30,
        deliveryTime: "Today, 25m",
        images: ["https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=300&h=300&fit=crop"],
        description: "Gentle oatmeal shampoo for sensitive skin",
        isActive: true,
    },
    {
        _id: "5",
        name: "Pedigree Dentastix",
        category: "health",
        price: 320,
        discount: 20,
        stock: 18,
        deliveryTime: "Today, 15m",
        images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop"],
        description: "Daily oral care treats for dogs",
        isActive: true,
    },
    {
        _id: "6",
        name: "Adjustable Pet Harness",
        category: "gear",
        price: 799,
        discount: 5,
        stock: 8,
        deliveryTime: "Tomorrow",
        images: ["https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=300&h=300&fit=crop"],
        description: "Comfortable and breathable pet harness",
        isActive: true,
    },
];

// ═══════════════════════════════════════════════════════
//  PRODUCT CARD
// ═══════════════════════════════════════════════════════
function ProductCard({
    product,
    cartQty,
    onAdd,
    onIncrement,
    onDecrement,
    isUpdating,
}: {
    product: Product & { effectivePrice?: number; inStock?: boolean };
    cartQty: number;
    onAdd: () => void;
    onIncrement: () => void;
    onDecrement: () => void;
    isUpdating: boolean;
}) {
    const effectivePrice = product.effectivePrice ??
        Math.round(product.price * (1 - product.discount / 100));
    const outOfStock = product.stock === 0 || product.inStock === false;
    const lowStock = product.stock > 0 && product.stock <= 5;

    return (
        <div className={cn(
            "bg-white border border-gray-100/60 bubble-card overflow-hidden relative flex flex-col",
            outOfStock && "opacity-70"
        )}>
            {/* Image */}
            <div className="relative aspect-square bg-gray-50/50 p-3">
                {/* Stock / Delivery Badge */}
                {lowStock && (
                    <div className="absolute top-2 left-2 z-10">
                        <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                            Only {product.stock} left
                        </span>
                    </div>
                )}
                {outOfStock && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <div className="bg-gray-900/70 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider backdrop-blur-sm">
                            Not Deliverable<br />In Your Area
                        </div>
                    </div>
                )}

                {/* Wishlist */}
                <button className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                    <Heart className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {product.images[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-gray-200" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3 pt-2 flex flex-col flex-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {product.category}
                </p>
                <h3 className="text-[13px] font-bold text-gray-900 leading-tight line-clamp-2 min-h-[2.4em] mt-0.5">
                    {product.name}
                </h3>
                {product.description && (
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium line-clamp-1">
                        {product.description}
                    </p>
                )}

                <div className="flex items-end justify-between mt-auto pt-2">
                    <div className="flex flex-col">
                        {product.discount > 0 && (
                            <span className="text-[10px] text-gray-400 line-through">
                                ₹{product.price}
                            </span>
                        )}
                        <span className="text-base font-black text-gray-900">
                            ₹{effectivePrice}
                        </span>
                    </div>

                    {/* Add / Qty Controls */}
                    {!outOfStock && (
                        <div>
                            {cartQty === 0 ? (
                                <button
                                    onClick={onAdd}
                                    disabled={isUpdating}
                                    className="w-8 h-8 bg-[#F05359] rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200 active:scale-90 transition-all disabled:opacity-50"
                                >
                                    {isUpdating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" strokeWidth={3} />
                                    )}
                                </button>
                            ) : (
                                <div className="flex items-center gap-0 bg-[#F05359] rounded-full shadow-lg shadow-red-200">
                                    <button
                                        onClick={onDecrement}
                                        disabled={isUpdating}
                                        className="w-7 h-7 flex items-center justify-center text-white active:scale-90 transition-all disabled:opacity-50"
                                    >
                                        <Minus className="w-3 h-3" strokeWidth={3} />
                                    </button>
                                    <span className="w-5 text-center text-xs font-black text-white">
                                        {isUpdating ? (
                                            <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                                        ) : (
                                            cartQty
                                        )}
                                    </span>
                                    <button
                                        onClick={onIncrement}
                                        disabled={isUpdating}
                                        className="w-7 h-7 flex items-center justify-center text-white active:scale-90 transition-all disabled:opacity-50"
                                    >
                                        <Plus className="w-3 h-3" strokeWidth={3} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
//  PURPOSE BANNER
// ═══════════════════════════════════════════════════════
function PurposeBanner() {
    return (
        <div className="px-4 py-2">
            <div className="relative bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] overflow-hidden bubble-float">
                {/* Decorative circles */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/15 rounded-full pointer-events-none" />
                <div className="absolute right-16 -top-4 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />

                {/* Paw decorative */}
                <div className="absolute top-2 right-4 text-6xl opacity-10 select-none pointer-events-none">
                    🐾
                </div>

                <div className="relative z-10 p-5 flex items-center gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">
                            Your Purchase Has A<br />Purpose
                        </h3>
                        <p className="text-[11px] text-gray-700/80 font-semibold">
                            10% proceeds go to local animal shelters 🏠
                        </p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shrink-0">
                        <img
                            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop"
                            alt="Puppy"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
//  FLOATING CART BAR
// ═══════════════════════════════════════════════════════
function FloatingCartBar({
    cart,
    onViewCart,
}: {
    cart: Cart | null;
    onViewCart: () => void;
}) {
    const itemCount = cart?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
    const total = cart?.total || 0;

    if (itemCount === 0) return null;

    return (
        <div className="fixed bottom-[72px] left-0 right-0 z-40 px-4 flex justify-center pointer-events-none animate-slide-up">
            <div className="w-full max-w-[400px] bg-[#2d2d2d] rounded-2xl px-4 py-3 shadow-xl flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F05359] rounded-full flex items-center justify-center relative">
                        <ShoppingBag className="w-5 h-5 text-white" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#F05359] text-[10px] font-black rounded-full flex items-center justify-center">
                            {itemCount}
                        </span>
                    </div>
                    <div>
                        <p className="text-white text-xs font-medium">
                            {itemCount} {itemCount === 1 ? "item" : "items"} added
                        </p>
                        <p className="text-white text-sm font-bold">
                            ₹{Math.round(total)}{" "}
                            <span className="text-gray-400 text-[10px] font-normal">
                                total
                            </span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={onViewCart}
                    className="flex items-center gap-1 bg-[#F05359] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e0484e] transition-colors active:scale-95"
                >
                    View Cart
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
//  MAIN STORE SECTION
// ═══════════════════════════════════════════════════════
export function StoreSection() {
    const { setActiveSection } = useSection();
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingProducts, setUpdatingProducts] = useState<Set<string>>(new Set());

    // Fetch products with category filter
    const categoryFilter = activeCategory === "all" ? undefined : activeCategory;
    const { products: apiProducts, isLoading } = useProducts(categoryFilter);
    const { cart, refetch: refetchCart } = useCart();

    const products = apiProducts.length > 0 ? apiProducts : FALLBACK_PRODUCTS;

    // Filter by search & category (for fallback)
    const filteredProducts = useMemo(() => {
        let filtered = products;
        if (activeCategory !== "all" && apiProducts.length === 0) {
            filtered = filtered.filter(
                (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
            );
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q)
            );
        }
        return filtered;
    }, [products, activeCategory, searchQuery, apiProducts.length]);

    // Build cart quantity map
    const cartQtyMap = useMemo(() => {
        const map: Record<string, number> = {};
        if (cart?.items) {
            for (const item of cart.items) {
                map[item.productId] = item.quantity;
            }
        }
        return map;
    }, [cart]);

    // ─── Cart Actions ────────────────────────────────────
    const updateCartItem = useCallback(
        async (productId: string, quantity: number) => {
            setUpdatingProducts((prev) => new Set(prev).add(productId));
            try {
                // Build full cart items array with the update
                const currentItems = cart?.items || [];
                const existingItems = currentItems
                    .filter((item) => item.productId !== productId)
                    .map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    }));

                const allItems = [
                    ...existingItems,
                    { productId, quantity: Math.max(0, quantity) },
                ];

                await api.post("/cart", { items: allItems });
                refetchCart();
            } catch {
                // silently fail
            } finally {
                setUpdatingProducts((prev) => {
                    const next = new Set(prev);
                    next.delete(productId);
                    return next;
                });
            }
        },
        [cart, refetchCart]
    );

    const handleAdd = useCallback(
        (productId: string) => updateCartItem(productId, 1),
        [updateCartItem]
    );

    const handleIncrement = useCallback(
        (productId: string) => {
            const current = cartQtyMap[productId] || 0;
            updateCartItem(productId, current + 1);
        },
        [cartQtyMap, updateCartItem]
    );

    const handleDecrement = useCallback(
        (productId: string) => {
            const current = cartQtyMap[productId] || 0;
            updateCartItem(productId, current - 1);
        },
        [cartQtyMap, updateCartItem]
    );

    const cartItemCount = cart?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

    return (
        <>
            {/* ── Sticky Header ─────────────────────────────── */}
            <div className="sticky top-0 z-50 bg-white pb-1">
                {/* Search Bar + Cart Icon */}
                <div className="px-4 pt-3 pb-2 flex items-center gap-2">
                    <div className="bg-gray-50 rounded-2xl flex items-center px-4 py-3 border border-gray-100 flex-1 min-w-0">
                        <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search pet food, toys, grooming..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 font-medium"
                        />
                    </div>

                    {/* Cart Icon */}
                    <button
                        onClick={() => setActiveSection("cart")}
                        className="relative w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 hover:bg-gray-100 active:scale-90 transition-all"
                        aria-label="View cart"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-9 h-9">
                            {/* Bowl body */}
                            <path d="M12 30 L18 52 Q20 56 24 56 L40 56 Q44 56 46 52 L52 30 Z" fill="#c8ede4" stroke="#2d2d2d" strokeWidth="2.5" strokeLinejoin="round" />
                            {/* Food scalloped top */}
                            <path d="M10 30 Q10 24 16 26 Q19 22 23 25 Q26 21 30 24 Q33 21 37 24 Q40 21 44 25 Q47 22 50 26 Q54 24 55 30 Z" fill="#f5e6a3" stroke="#2d2d2d" strokeWidth="2.5" strokeLinejoin="round" />
                            {/* Food detail curves */}
                            <path d="M26 27 Q28 29 30 27" stroke="#d4c87a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                            <path d="M36 26 Q38 28 40 26" stroke="#d4c87a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                            {/* Bowl side lines */}
                            <line x1="17" y1="35" x2="19" y2="48" stroke="#2d2d2d" strokeWidth="1.8" strokeLinecap="round" />
                            <line x1="20" y1="35" x2="22" y2="48" stroke="#2d2d2d" strokeWidth="1.8" strokeLinecap="round" />
                            {/* Bone */}
                            <rect x="27" y="41" width="10" height="4" rx="1" fill="white" stroke="#2d2d2d" strokeWidth="1.8" />
                            <circle cx="27" cy="41" r="2.5" fill="white" stroke="#2d2d2d" strokeWidth="1.8" />
                            <circle cx="27" cy="45" r="2.5" fill="white" stroke="#2d2d2d" strokeWidth="1.8" />
                            <circle cx="37" cy="41" r="2.5" fill="white" stroke="#2d2d2d" strokeWidth="1.8" />
                            <circle cx="37" cy="45" r="2.5" fill="white" stroke="#2d2d2d" strokeWidth="1.8" />
                            {/* Bone white fill to cover inner lines */}
                            <rect x="27" y="41" width="10" height="4" rx="1" fill="white" />
                            <circle cx="27" cy="41" r="1.5" fill="white" />
                            <circle cx="27" cy="45" r="1.5" fill="white" />
                            <circle cx="37" cy="41" r="1.5" fill="white" />
                            <circle cx="37" cy="45" r="1.5" fill="white" />
                        </svg>

                        {/* Cart badge */}
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#F05359] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-md shadow-red-200 animate-bounce-in">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto px-4 pb-2 hide-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                                activeCategory === cat.id
                                    ? "bg-[#F05359] text-white border-[#F05359] shadow-md shadow-red-200"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <span className="text-sm">{cat.emoji}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Divider with delivery badge */}
                <div className="px-4 pb-2 flex items-center gap-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    <span className="text-[9px] font-bold text-[#F05359] uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full">
                        ⚡ 15 Min Delivery
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>
            </div>

            {/* ── Content ───────────────────────────────────── */}
            <main className="pb-36 paw-bg bg-gray-50/30">
                {/* Purpose Banner */}
                <PurposeBanner />

                {/* Daily Essentials Section */}
                <div className="px-4 pt-4 pb-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-black text-gray-900">
                            Daily Essentials
                        </h2>
                        <button className="text-[#F05359] text-xs font-bold hover:underline">
                            View all
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 text-[#F05359] animate-spin mb-3" />
                            <p className="text-xs text-gray-400 font-medium">
                                Loading products...
                            </p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-3">🐾</div>
                            <p className="text-sm text-gray-500 font-bold">
                                No products found
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Try a different category or search term
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    cartQty={cartQtyMap[product._id] || 0}
                                    onAdd={() => handleAdd(product._id)}
                                    onIncrement={() => handleIncrement(product._id)}
                                    onDecrement={() => handleDecrement(product._id)}
                                    isUpdating={updatingProducts.has(product._id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Offers Banner */}
                <div className="px-4 py-4">
                    <div className="relative bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] overflow-hidden bubble-float">
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/15 rounded-full pointer-events-none" />
                        <div className="absolute right-12 -top-4 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
                        <div className="absolute top-3 right-5 text-5xl opacity-15 select-none pointer-events-none rotate-12">
                            🎁
                        </div>
                        <div className="relative z-10 p-5">
                            <div className="inline-flex items-center gap-1.5 bg-orange-500/10 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-2">
                                <span className="text-[9px] font-black text-orange-700 uppercase tracking-widest leading-none">
                                    Special Offer
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight mb-1">
                                First order? Get 20% OFF!
                            </h3>
                            <p className="text-xs text-gray-700/80 font-semibold">
                                Use code <span className="text-orange-600 font-black">PETBUDDY20</span> at checkout
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Services */}
                <div className="px-4 pt-2 pb-6">
                    <h2 className="text-lg font-black text-gray-900 mb-3">Quick Services</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { emoji: "✂️", label: "Grooming", sub: "At Home" },
                            { emoji: "💉", label: "Vaccination", sub: "Book Now" },
                            { emoji: "🏥", label: "Vet Visit", sub: "Online" },
                        ].map((service) => (
                            <button
                                key={service.label}
                                className="bg-white border border-gray-100/60 rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:border-[#F05359]/30 transition-all active:scale-95 bubble-card"
                            >
                                <span className="text-2xl">{service.emoji}</span>
                                <span className="text-xs font-bold text-gray-800">
                                    {service.label}
                                </span>
                                <span className="text-[9px] font-semibold text-[#F05359] bg-red-50 px-2 py-0.5 rounded-full">
                                    {service.sub}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* ── Floating Cart ─────────────────────────────── */}
            <FloatingCartBar
                cart={cart}
                onViewCart={() => setActiveSection("cart")}
            />
        </>
    );
}
