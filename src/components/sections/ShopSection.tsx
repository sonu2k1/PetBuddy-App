"use client";

import { useState, useMemo } from "react";
import { Search, Filter, ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSection } from "@/context/SectionContext";
import { useProducts, useCart, api, type Product } from "@/hooks/useData";

const CATEGORIES = ["All Pets", "Dogs", "Cats", "Birds", "Small Pets"];
const SUB_CATEGORIES = ["All", "Food", "Grooming", "Toys", "Health", "Gear"];

const FALLBACK_PRODUCTS: Product[] = [
    {
        _id: '1',
        name: "Premium Adult Dry Dog Food - Chicken",
        category: "food",
        price: 45.99,
        discount: 12,
        stock: 50,
        deliveryTime: "Today, 30m",
        images: ["https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=150&h=150&fit=crop"],
        description: "High-quality adult dog food",
        isActive: true,
    },
    {
        _id: '2',
        name: "Interactive Feather Wand Cat Toy",
        category: "toys",
        price: 12.50,
        discount: 0,
        stock: 100,
        deliveryTime: "Today, 45m",
        images: ["https://images.unsplash.com/photo-1615266895738-11f1371cd7e5?w=150&h=150&fit=crop"],
        description: "Fun interactive cat toy",
        isActive: true,
    },
    {
        _id: '3',
        name: "Hypoallergenic Puppy Shampoo",
        category: "grooming",
        price: 18.00,
        discount: 25,
        stock: 30,
        deliveryTime: "Tomorrow",
        images: ["https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=150&h=150&fit=crop"],
        description: "Gentle shampoo for puppies",
        isActive: true,
    },
    {
        _id: '4',
        name: "Ultra-Soft Orthopedic Bed",
        category: "gear",
        price: 89.99,
        discount: 0,
        stock: 15,
        deliveryTime: "Today, 1h",
        images: ["https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=150&h=150&fit=crop"],
        description: "Memory foam pet bed",
        isActive: true,
    },
];

export function ShopSection() {
    const [activeCategory, setActiveCategory] = useState("All Pets");
    const [activeSubCategory, setActiveSubCategory] = useState("All");
    const { setActiveSection } = useSection();
    const { products: apiProducts, isLoading } = useProducts();
    const { cart } = useCart();

    const products = apiProducts.length > 0 ? apiProducts : FALLBACK_PRODUCTS;
    const cartCount = cart?.items?.length || 0;

    const filteredProducts = useMemo(() => {
        if (activeSubCategory === "All") return products;
        return products.filter(p => p.category.toLowerCase() === activeSubCategory.toLowerCase());
    }, [products, activeSubCategory]);

    const handleAddToCart = async (productId: string) => {
        try {
            await api.post("/cart", { productId, quantity: 1 });
        } catch {
            // silently fail for now
        }
    };

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white pb-2">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex-1">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-800">
                            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-bold text-gray-900">Shop Supplies</h1>
                    <div className="flex-1 flex justify-end relative">
                        <button onClick={() => setActiveSection("cart")}>
                            <ShoppingCart className="w-6 h-6 text-gray-800" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">{cartCount}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-4 mb-3">
                    <div className="bg-gray-50 rounded-2xl flex items-center px-4 py-3 border border-gray-100">
                        <Search className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search food, toys, meds..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 font-medium"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto px-4 pb-3 hide-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                                activeCategory === cat
                                    ? "bg-primary text-white border-primary shadow-lg shadow-red-100"
                                    : "bg-white text-gray-600 border-gray-100"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Sub Categories & Filter */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
                    <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                        {SUB_CATEGORIES.map(sub => (
                            <button
                                key={sub}
                                onClick={() => setActiveSubCategory(sub)}
                                className={cn(
                                    "text-xs font-bold whitespace-nowrap transition-colors relative",
                                    activeSubCategory === sub
                                        ? "text-primary after:content-[''] after:absolute after:-bottom-2.5 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-1 text-xs font-bold text-gray-600 pl-4 border-l border-gray-100">
                        <Filter className="w-3 h-3" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Product Grid */}
            <main className="px-4 py-4 pb-32 bg-gray-50/50 min-h-screen paw-bg">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="font-bold text-gray-900 text-base">Best Sellers</h2>
                        <p className="text-[10px] text-gray-500">Showing {filteredProducts.length} items</p>
                    </div>
                    <button className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-600 flex items-center gap-1">
                        Most Popular
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-[#F05359] animate-spin" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-gray-400">No products found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredProducts.map(product => (
                            <div key={product._id} className="bg-white p-3 rounded-3xl group bubble-card">
                                <div className="relative aspect-square rounded-2xl bg-gray-100 mb-3 overflow-hidden">
                                    {product.images[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50">
                                            <ShoppingCart className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}
                                    <button className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                                        <div className="w-4 h-4"><ShoppingCart className="w-3.5 h-3.5" /></div>
                                    </button>
                                    {product.stock < 10 && product.stock > 0 && (
                                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                            Only {product.stock} left
                                        </div>
                                    )}
                                </div>

                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{product.category}</p>
                                <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[2.5em] mb-1">{product.name}</h3>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-black text-gray-900">₹{product.price}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAddToCart(product._id)}
                                    className="w-full mt-3 bg-primary/10 hover:bg-primary text-primary hover:text-white py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
