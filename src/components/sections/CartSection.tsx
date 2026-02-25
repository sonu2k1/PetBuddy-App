"use client";

import { ArrowLeft, Truck, Minus, Plus, ChevronRight, CalendarCheck, MapPin, Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSection } from "@/context/SectionContext";
import { PawToggle } from "@/components/ui/PawToggle";
import { useCart, api } from "@/hooks/useData";

const FALLBACK_ITEMS = [
    {
        productId: "1",
        name: "Wellness CORE Grain-Free Adult Dry Dog Food",
        price: 64.99,
        discount: 0,
        quantity: 1,
    },
    {
        productId: "2",
        name: "Nylabone Power Chew Textured Ring Bone",
        price: 12.45,
        discount: 0,
        quantity: 2,
    }
];

export function CartSection() {
    const { setActiveSection } = useSection();
    const [autoship, setAutoship] = useState(false);
    const { cart, isLoading, refetch } = useCart();

    const items = cart?.items && cart.items.length > 0 ? cart.items : FALLBACK_ITEMS;
    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const totalDiscount = items.reduce((acc, i) => acc + (i.discount || 0) * i.quantity, 0);
    const grandTotal = subtotal - totalDiscount;

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity < 0) return;
        try {
            await api.post("/cart", { productId, quantity });
            refetch();
        } catch {
            // silently fail
        }
    };

    return (
        <>
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-50">
                <button onClick={() => setActiveSection("shop")} className="p-1 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">My Cart</h1>
            </div>

            <main className="px-4 py-6 pb-32 min-h-screen paw-bg">
                {/* Delivery Estimate */}
                <div className="bg-white p-4 flex items-center gap-4 border border-gray-100/50 mb-6 bubble-card">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center shadow-sm">
                        <Truck className="w-5.5 h-5.5 text-gray-700" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">ESTIMATED DELIVERY</p>
                        <p className="text-sm font-bold text-gray-900">Arriving in 32 mins</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold bg-green-50 px-3 py-1.5 rounded-full text-green-600 border border-green-100">Express</span>
                </div>

                {/* Address */}
                <div className="mb-6 px-1">
                    <div className="flex justify-between items-baseline mb-1">
                        <h3 className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                            <MapPin className="w-4 h-4 text-[#F05359]" />
                            Deliver to Home
                        </h3>
                        <button className="text-xs font-bold text-[#F05359]">Change</button>
                    </div>
                    <p className="text-xs text-gray-500 font-medium pl-6">214-A Swaraj Nagar, Panki, Kanpur</p>
                </div>

                {/* Items */}
                <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-4 px-1">Review Items ({totalItems})</h3>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 text-[#F05359] animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">Your cart is empty</p>
                            <button
                                onClick={() => setActiveSection("shop")}
                                className="mt-4 px-6 py-2 bg-[#F05359] text-white rounded-xl text-sm font-bold"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.productId} className="bg-white p-3 flex gap-3 border border-gray-100/50 bubble-card">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-50 to-orange-50 shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                                        <ShoppingCart className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-xs leading-tight line-clamp-2 mt-0.5">{item.name}</h4>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-bold text-[#F05359] text-sm">₹{item.price}</span>
                                            <div className="bg-gray-50 rounded-xl flex items-center p-1 border border-gray-100">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                                >
                                                    <Minus className="w-3 h-3 text-gray-600" />
                                                </button>
                                                <span className="w-7 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                                >
                                                    <Plus className="w-3 h-3 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Autoship Banner */}
                <div className="bg-pink-50/50 border border-pink-100 rounded-3xl p-4 mb-8 bubble-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-[#F05359] flex items-center justify-center text-white shadow-lg shadow-red-200">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M2 12h20M12 2l4 4M12 2 8 6" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-sm">Autoship & Save</h4>
                                <p className="text-[10px] text-gray-500 max-w-[180px] leading-tight mt-0.5 font-medium">Unlock <span className="text-[#F05359] font-bold">5% discount</span> on recurring orders.</p>
                            </div>
                        </div>
                        <PawToggle
                            checked={autoship}
                            onChange={setAutoship}
                            variant="paw"
                            size="md"
                        />
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-2 text-[10px] text-[#F05359] font-bold ring-1 ring-[#F05359]/10">
                        <CalendarCheck className="w-3.5 h-3.5" />
                        Scheduled every 4 weeks • Next: Nov 12
                    </div>
                </div>
            </main>

            {/* Checkout Bar */}
            <div className="fixed bottom-[80px] left-0 right-0 max-w-[430px] mx-auto bg-white p-5 border-t border-gray-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">GRAND TOTAL</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900">₹{grandTotal.toFixed(2)}</span>
                            {totalDiscount > 0 && (
                                <span className="text-[10px] font-bold text-green-500">(₹{totalDiscount.toFixed(2)} Saved)</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-medium text-gray-500">{totalItems} items • Free Delivery</p>
                        <p className="text-[10px] font-bold text-[#F05359]">Earn {Math.floor(grandTotal)} BuddyPoints</p>
                    </div>
                </div>

                <button className="w-full bg-[#F05359] text-white h-14 rounded-2xl font-black text-base shadow-xl shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2 bubble-float">
                    Place Order
                    <ChevronRight className="w-5 h-5" />
                </button>

                <p className="text-[9px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    By tapping, you agree to PetBuddyCentral&apos;s terms.
                </p>
            </div>
        </>
    );
}
