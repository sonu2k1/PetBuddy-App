"use client";

import { ArrowLeft, Phone, MessageCircle, MapPin, Package, Clock, CheckCircle2, Truck, ChefHat } from "lucide-react";
import { useSection } from "@/context/SectionContext";
import { useState, useEffect } from "react";

const TRACKING_STEPS = [
    {
        id: 1,
        label: "Order Placed",
        description: "Your order has been confirmed",
        time: "5:40 PM",
        icon: CheckCircle2,
        completed: true,
    },
    {
        id: 2,
        label: "Preparing",
        description: "Items are being packed with care 🐾",
        time: "5:42 PM",
        icon: ChefHat,
        completed: true,
    },
    {
        id: 3,
        label: "Out for Delivery",
        description: "Rahul is on the way!",
        time: "5:48 PM",
        icon: Truck,
        completed: true,
        active: true,
    },
    {
        id: 4,
        label: "Delivered",
        description: "Happy tails! 🎉",
        time: "~5:55 PM",
        icon: Package,
        completed: false,
    },
];

export function TrackOrderSection() {
    const { setActiveSection } = useSection();
    const [eta, setEta] = useState(8);

    // Simulate countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setEta((prev) => (prev > 1 ? prev - 1 : 1));
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            {/* ── Header ──────────────────────────────────── */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => setActiveSection("order-confirmation")}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors active:scale-90"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Track Order</h1>
            </div>

            <main className="px-4 pb-32 bg-[#faf9f7] min-h-screen">

                {/* ── Map Area ─────────────────────────────── */}
                <div className="rounded-3xl overflow-hidden border border-gray-100/60 shadow-sm mb-5 relative">
                    <div className="h-48 bg-gray-100">
                        <iframe
                            src="https://www.openstreetmap.org/export/embed.html?bbox=80.30%2C26.43%2C80.40%2C26.49&layer=mapnik&marker=26.46%2C80.35"
                            className="w-full h-full border-0"
                            title="Delivery tracking map"
                            loading="lazy"
                        />
                    </div>

                    {/* ETA Overlay */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-white/50">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Arriving in</p>
                        <p className="text-xl font-black text-gray-900">{eta} mins</p>
                    </div>
                </div>

                {/* ── Delivery Person ──────────────────────── */}
                <div className="bg-white rounded-3xl p-4 flex items-center gap-3 mb-5 shadow-sm border border-gray-100/60">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-200 shrink-0">
                        R
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">Rahul Kumar</p>
                        <p className="text-[11px] text-gray-400 font-medium">Delivery Partner • ⭐ 4.8</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center hover:bg-emerald-100 active:scale-90 transition-all">
                            <Phone className="w-4 h-4 text-emerald-600" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center hover:bg-blue-100 active:scale-90 transition-all">
                            <MessageCircle className="w-4 h-4 text-blue-600" />
                        </button>
                    </div>
                </div>

                {/* ── Order Status ─────────────────────────── */}
                <div className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100/60">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-gray-900">Order Status</h3>
                        <span className="text-[10px] font-bold bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100">
                            On the way
                        </span>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-0">
                        {TRACKING_STEPS.map((step, index) => {
                            const StepIcon = step.icon;
                            const isLast = index === TRACKING_STEPS.length - 1;

                            return (
                                <div key={step.id} className="flex gap-3">
                                    {/* Timeline line + dot */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${step.active
                                                ? "bg-[#F05359] shadow-lg shadow-red-200"
                                                : step.completed
                                                    ? "bg-emerald-400 shadow-sm"
                                                    : "bg-gray-100 border border-gray-200"
                                            }`}>
                                            <StepIcon className={`w-4 h-4 ${step.completed || step.active ? "text-white" : "text-gray-400"
                                                }`} />
                                        </div>
                                        {!isLast && (
                                            <div className={`w-0.5 h-12 my-1 rounded-full ${step.completed ? "bg-emerald-300" : "bg-gray-200"
                                                }`} />
                                        )}
                                    </div>

                                    {/* Step content */}
                                    <div className="pt-1.5 pb-4 min-w-0">
                                        <p className={`text-sm font-bold ${step.active ? "text-[#F05359]" : step.completed ? "text-gray-900" : "text-gray-400"
                                            }`}>
                                            {step.label}
                                        </p>
                                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{step.description}</p>
                                        <p className={`text-[10px] mt-1 font-bold ${step.active ? "text-[#F05359]" : step.completed ? "text-gray-400" : "text-gray-300"
                                            }`}>
                                            {step.time}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Delivery Address ─────────────────────── */}
                <div className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100/60">
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-sm font-bold text-gray-900">Delivering To</h3>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3">
                        <p className="text-sm font-bold text-gray-800">Home</p>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">
                            12/456, Civil Lines, Near Green Park Stadium, Kanpur, UP - 208001
                        </p>
                    </div>
                </div>

                {/* ── Order Details ────────────────────────── */}
                <div className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100/60">
                    <div className="flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-[#F05359]" />
                        <h3 className="text-sm font-bold text-gray-900">Order Details</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 font-medium">Order ID</span>
                            <span className="text-xs font-bold text-gray-900">#PB-88291</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 font-medium">Payment</span>
                            <span className="text-xs font-bold text-gray-900">UPI</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 font-medium">Total Paid</span>
                            <span className="text-xs font-bold text-[#F05359]">₹1,240.00</span>
                        </div>
                    </div>
                </div>

                {/* ── Help Section ─────────────────────────── */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-5 border border-pink-100/50 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Need Help?</h3>
                    <p className="text-[11px] text-gray-500 font-medium mb-3">
                        Our support team is always ready to assist you and your furry friend.
                    </p>
                    <button className="bg-white text-[#F05359] text-xs font-bold px-5 py-2.5 rounded-full shadow-sm border border-pink-100 hover:shadow-md transition-all active:scale-95">
                        Contact Support 🐾
                    </button>
                </div>
            </main>

            {/* ── Bottom Bar ──────────────────────────────── */}
            <div className="fixed bottom-[72px] left-0 right-0 max-w-[430px] mx-auto p-4 bg-gradient-to-t from-white via-white to-white/80 z-40">
                <button
                    onClick={() => setActiveSection("home")}
                    className="w-full bg-[#F05359] text-white h-14 rounded-full font-black text-base shadow-xl shadow-red-200/50 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                >
                    Back to Home
                    <span className="text-lg">🏠</span>
                </button>
            </div>
        </>
    );
}
