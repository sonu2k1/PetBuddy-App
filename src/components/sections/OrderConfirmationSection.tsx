"use client";

import { ArrowLeft, Heart, MapPin, Package, Clock } from "lucide-react";
import { useSection } from "@/context/SectionContext";
import { useCart } from "@/hooks/useData";
import { useMemo } from "react";

const FALLBACK_ITEMS = [
    { productId: "1", name: "Premium Puppy Kibble", price: 850, quantity: 1 },
    { productId: "2", name: "Squeaky Rubber Bone", price: 390, quantity: 2 },
];

export function OrderConfirmationSection() {
    const { setActiveSection } = useSection();
    const { cart } = useCart();

    const items = cart?.items && cart.items.length > 0 ? cart.items : FALLBACK_ITEMS;
    const totalPaid = useMemo(() => {
        const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
        return subtotal + 10; // +₹10 impact contribution
    }, [items]);

    const orderId = `PB-${Math.floor(10000 + Math.random() * 90000)}`;

    return (
        <>
            {/* ── Header ──────────────────────────────────── */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => setActiveSection("store")}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors active:scale-90"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Order Confirmed</h1>
            </div>

            <main className="px-4 pb-8 bg-[#faf9f7] min-h-screen">
                {/* ── Success Hero ─────────────────────────── */}
                <div className="flex flex-col items-center pt-6 pb-5">
                    {/* Dog illustration circle */}
                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100/60 flex items-center justify-center mb-5 shadow-sm overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=150&h=150&fit=crop"
                            alt="Happy dog"
                            className="w-20 h-20 object-cover rounded-2xl"
                        />
                    </div>

                    <h2 className="text-xl font-black text-gray-900 text-center leading-tight">
                        Woof! Order Placed<br />Successfully!
                    </h2>
                    <p className="text-sm text-gray-400 mt-2 font-medium">
                        Sit tight, treats are on the way!
                    </p>
                </div>

                {/* ── Order ID + ETA ───────────────────────── */}
                <div className="bg-white rounded-3xl p-4 flex items-center justify-between mb-4 shadow-sm border border-gray-100/60">
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                        <p className="text-base font-black text-gray-900 mt-0.5">#{orderId}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Arrival</p>
                            <p className="text-xs font-bold text-gray-800">15-20 mins</p>
                        </div>
                    </div>
                </div>

                {/* ── Your Impact ──────────────────────────── */}
                <div className="bg-white rounded-3xl p-4 flex items-center gap-3 mb-4 shadow-sm border border-gray-100/60">
                    <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                        <Heart className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Your Impact</p>
                        <p className="text-[11px] text-gray-500 font-medium leading-tight">
                            1% of this purchase donated to <span className="font-bold text-emerald-600">Kanpur Local Animal Rescue Fund</span>.
                        </p>
                    </div>
                </div>

                {/* ── Share the Love ───────────────────────── */}
                <div className="bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl p-5 mb-4 shadow-md relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
                    <div className="absolute right-12 bottom-0 w-16 h-16 bg-white/5 rounded-full pointer-events-none" />

                    <h3 className="text-lg font-black text-white mb-1">Share the Love!</h3>
                    <p className="text-[12px] text-white/85 font-medium leading-snug mb-3">
                        Refer a fellow pet parent and you both get ₹200 off your next order.
                    </p>
                    <button className="bg-white text-emerald-600 text-xs font-bold px-5 py-2 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95">
                        Refer Now
                    </button>
                </div>

                {/* ── Order Summary ────────────────────────── */}
                <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100/60">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-4 h-4 text-[#F05359]" />
                        <h3 className="text-base font-bold text-gray-900">Order Summary</h3>
                    </div>

                    <div className="space-y-3 mb-4">
                        {items.map(item => (
                            <div key={item.productId} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">
                                    {item.name} x{item.quantity}
                                </span>
                                <span className="text-sm font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                        <span className="text-sm font-black text-gray-900">Total Amount Paid</span>
                        <span className="text-lg font-black text-[#F05359]">₹{totalPaid.toFixed(2)}</span>
                    </div>
                </div>

                {/* ── Delivery Address ─────────────────────── */}
                <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-gray-100/60">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-base font-bold text-gray-900">Delivery Address</h3>
                    </div>

                    <div className="flex items-start gap-3">
                        {/* Mini map */}
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                            <iframe
                                src="https://www.openstreetmap.org/export/embed.html?bbox=80.33%2C26.45%2C80.36%2C26.47&layer=mapnik&marker=26.46%2C80.35"
                                className="w-full h-full border-0"
                                title="Delivery map"
                                loading="lazy"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Home</p>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">
                                12/456, Civil Lines,<br />
                                Near Green Park Stadium,<br />
                                Kanpur, Uttar Pradesh - 208001
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Action Buttons ───────────────────────── */}
                <div className="space-y-3 pb-20">
                    <button
                        onClick={() => setActiveSection("track-order")}
                        className="w-full bg-[#F05359] text-white h-14 rounded-full font-black text-base shadow-xl shadow-red-200/50 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                    >
                        Track Order
                    </button>
                    <button
                        onClick={() => setActiveSection("home")}
                        className="w-full text-gray-600 text-sm font-bold py-3 hover:text-gray-900 transition-colors active:scale-[0.98]"
                    >
                        Back to Home
                    </button>
                </div>
            </main>
        </>
    );
}
