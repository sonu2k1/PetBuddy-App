"use client";

import { ArrowLeft, Truck, Minus, Plus, ChevronRight, CalendarCheck, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSection } from "@/context/SectionContext";

const CART_ITEMS = [
    {
        id: 1,
        name: "Wellness CORE Grain-Free Adult Dry Dog Food",
        brand: "WELLNESS",
        price: 64.99,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=150&h=150&fit=crop"
    },
    {
        id: 2,
        name: "Nylabone Power Chew Textured Ring Bone",
        brand: "NYLABONE",
        price: 12.45,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&h=150&fit=crop"
    }
];

export function CartSection() {
    const { setActiveSection } = useSection();
    const [autoship, setAutoship] = useState(false);

    return (
        <>
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-50">
                <button onClick={() => setActiveSection("shop")} className="p-1 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">My Cart</h1>
            </div>

            <main className="px-4 py-6 pb-32 bg-gray-50/30 min-h-screen">
                {/* Delivery Estimate */}
                <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-gray-100 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">ESTIMATED DELIVERY</p>
                        <p className="text-sm font-bold text-gray-900">Arriving in 32 mins</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-600">Express</span>
                </div>

                {/* Address */}
                <div className="mb-6">
                    <div className="flex justify-between items-baseline mb-2">
                        <h3 className="flex items-center gap-2 font-bold text-gray-900">
                            <MapPin className="w-4 h-4 text-primary" />
                            Deliver to Home
                        </h3>
                        <button className="text-xs font-bold text-primary">Change</button>
                    </div>
                    <p className="text-xs text-gray-500 pl-6">214-A Swaraj Nagar, Panki, Kanpur, 208020</p>
                </div>

                {/* Items */}
                <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-4">Review Items ({CART_ITEMS.length})</h3>
                    <div className="space-y-4">
                        {CART_ITEMS.map(item => (
                            <div key={item.id} className="bg-white rounded-[24px] p-3 flex gap-3 shadow-soft">
                                <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{item.brand}</p>
                                        <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{item.name}</h4>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="font-bold text-primary text-base">${item.price}</span>
                                        <div className="bg-gray-50 rounded-xl flex items-center p-1">
                                            <button className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all"><Minus className="w-3 h-3 text-gray-600" /></button>
                                            <span className="w-6 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                                            <button className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all"><Plus className="w-3 h-3 text-gray-600" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Order Banner */}
                <div className="flex items-center justify-between bg-transparent mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Active Order #4920</p>
                            <p className="text-[10px] text-gray-500">Out for delivery • Track on map</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Autoship Banner */}
                <div className="bg-red-50 rounded-[24px] p-4 mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20M12 2l4 4M12 2 8 6" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Autoship & Save</h4>
                                <p className="text-[10px] text-gray-500 max-w-[150px] leading-tight mt-0.5">Unlock <span className="text-primary font-bold">5% discount</span> on this and all future recurring orders.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAutoship(!autoship)}
                            className={cn(
                                "w-12 h-7 rounded-full transition-colors relative",
                                autoship ? "bg-primary" : "bg-gray-300"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform",
                                autoship ? "translate-x-5.5 left-0" : "left-0.5"
                            )} />
                        </button>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 flex items-center gap-2 text-xs text-primary font-bold">
                        <CalendarCheck className="w-4 h-4" />
                        Scheduled every 4 weeks • Next: Nov 12
                    </div>
                </div>

                {/* Scheduled Deliveries */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-900">Scheduled Deliveries</h3>
                        <button className="text-xs font-bold text-primary">Manage</button>
                    </div>
                </div>
            </main>

            {/* Checkout Bar */}
            <div className="fixed bottom-[80px] left-0 right-0 max-w-[430px] mx-auto bg-white p-5 border-t border-gray-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">GRAND TOTAL</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900">$89.99</span>
                            <span className="text-[10px] font-bold text-gray-400 line-through">($4.50 Saved)</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-medium text-gray-500">3 items • Free Delivery</p>
                        <p className="text-[10px] font-bold text-primary">Earn 90 BuddyPoints</p>
                    </div>
                </div>

                <button className="w-full bg-primary hover:bg-primary-600 text-white h-14 rounded-2xl font-bold text-base shadow-xl shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2">
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
