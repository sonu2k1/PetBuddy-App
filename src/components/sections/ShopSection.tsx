"use client";

import { useState } from "react";
import { Search, Filter, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSection } from "@/context/SectionContext";

const CATEGORIES = ["All Pets", "Dogs", "Cats", "Birds", "Small Pets"];
const SUB_CATEGORIES = ["All", "Food", "Grooming", "Toys", "Health", "Gear"];

const PRODUCTS = [
    {
        id: 1,
        name: "Premium Adult Dry Dog Food - Chicken",
        brand: "BARKLEY & CO",
        rating: 4.8,
        price: 45.99,
        originalPrice: 52.00,
        discount: "12% OFF",
        image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=150&h=150&fit=crop",
        eta: "Today, 30m"
    },
    {
        id: 2,
        name: "Interactive Feather Wand Cat Toy",
        brand: "MEOWMIXER",
        rating: 4.9,
        price: 12.50,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1615266895738-11f1371cd7e5?w=150&h=150&fit=crop",
        eta: "Today, 45m"
    },
    {
        id: 3,
        name: "Hypoallergenic Puppy Shampoo",
        brand: "PETPURITY",
        rating: 4.7,
        price: 18.00,
        originalPrice: 24.00,
        discount: "25% OFF",
        image: "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=150&h=150&fit=crop",
        eta: "Tomorrow"
    },
    {
        id: 4,
        name: "Ultra-Soft Orthopedic Memory Foam Bed",
        brand: "CLOUDNINE",
        rating: 5.0,
        price: 89.99,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=150&h=150&fit=crop",
        eta: "Today, 1h"
    },
    {
        id: 5,
        name: "Wild Salmon Bites Grain-Free Treats",
        brand: "OCEANBOUNTY",
        rating: 4.6,
        price: 9.99,
        originalPrice: 12.99,
        discount: "SAVE $3",
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&h=150&fit=crop",
        eta: "Today, 25m"
    },
    {
        id: 6,
        name: "Adjustable Safety Harness - Ocean Blue",
        brand: "SWIFTPAW",
        rating: 4.8,
        price: 22.50,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1551848576-9d332945fc00?w=150&h=150&fit=crop",
        eta: "Today, 40m"
    }
];

export function ShopSection() {
    const [activeCategory, setActiveCategory] = useState("All Pets");
    const [activeSubCategory, setActiveSubCategory] = useState("All");
    const { setActiveSection } = useSection();

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
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">2</span>
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
            <main className="px-4 py-4 pb-32 bg-gray-50/50 min-h-screen">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="font-bold text-gray-900 text-base">Best Sellers</h2>
                        <p className="text-[10px] text-gray-500">Showing 6 items</p>
                    </div>
                    <button className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-600 flex items-center gap-1">
                        Most Popular
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {PRODUCTS.map(product => (
                        <div key={product.id} className="bg-white p-3 rounded-3xl shadow-soft group">
                            <div className="relative aspect-square rounded-2xl bg-gray-100 mb-3 overflow-hidden">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <button className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                                    <div className="w-4 h-4"><ShoppingCart className="w-3.5 h-3.5" /></div>
                                </button>
                                {product.discount && (
                                    <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                        {product.discount}
                                    </div>
                                )}
                            </div>

                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{product.brand}</p>
                            <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[2.5em] mb-1">{product.name}</h3>

                            <div className="flex items-center gap-1 mb-2">
                                <div className="flex text-yellow-400">
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                </div>
                                <span className="text-[10px] font-bold text-gray-600">{product.rating}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-black text-gray-900">${product.price}</span>
                                    {product.originalPrice && (
                                        <span className="text-[10px] font-medium text-gray-400 line-through ml-1">${product.originalPrice.toFixed(2)}</span>
                                    )}
                                </div>
                            </div>

                            <button className="w-full mt-3 bg-primary/10 hover:bg-primary text-primary hover:text-white py-2 rounded-xl text-xs font-bold transition-all">
                                Add to Cart
                            </button>

                            <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 font-medium">
                                <div className="w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 border-t border-r border-gray-400 rotate-45"></div>
                                </div>
                                ETA: <span className="text-cyan-600">{product.eta}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
}
