"use client";

import { ArrowLeft, Minus, Plus, Loader2, ShoppingCart, Heart, CreditCard, Banknote, Smartphone } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSection } from "@/context/SectionContext";
import { useCart, api } from "@/hooks/useData";

const FALLBACK_ITEMS = [
    {
        productId: "1",
        name: "Pedigree Dog Food",
        description: "3kg Pack",
        price: 850,
        discount: 0,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=200&h=200&fit=crop",
    },
    {
        productId: "2",
        name: "Rubber Squeaky Toy",
        description: "Blue • Medium",
        price: 249,
        discount: 0,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1615266895738-11f1371cd7e5?w=200&h=200&fit=crop",
    }
];

type PaymentMethod = "upi" | "card" | "cod";

export function CartSection() {
    const { setActiveSection } = useSection();
    const { cart, isLoading, refetch } = useCart();
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("upi");

    const items = cart?.items && cart.items.length > 0 ? cart.items : FALLBACK_ITEMS;
    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const deliveryFee = 0;
    const impactContribution = 10;
    const grandTotal = subtotal + deliveryFee + impactContribution;

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity < 0) return;
        try {
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
            refetch();
        } catch {
            // silently fail
        }
    };

    const paymentMethods = [
        { id: "upi" as PaymentMethod, label: "UPI", icon: <Smartphone className="w-5 h-5" /> },
        { id: "card" as PaymentMethod, label: "Card", icon: <CreditCard className="w-5 h-5" /> },
        { id: "cod" as PaymentMethod, label: "COD", icon: <Banknote className="w-5 h-5" /> },
    ];

    return (
        <>
            {/* ── Header ──────────────────────────────────────── */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => setActiveSection("store")}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors active:scale-90"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
            </div>

            <main className="px-4 pb-36 bg-[#fafafa] min-h-screen">
                {/* ── Delivery To ─────────────────────────────── */}
                <section className="mb-5">
                    <h2 className="text-base font-bold text-gray-900 mb-3">Delivery To</h2>
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/60">
                        {/* Address Info */}
                        <div className="p-4 pb-2 flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#F05359]/10 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-[#F05359]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Home Address</p>
                                <p className="text-xs text-gray-500 mt-0.5">12/456, Civil Lines, Kanpur, 208001</p>
                            </div>
                        </div>

                        {/* Map Preview */}
                        <div className="mx-4 mb-3 rounded-2xl overflow-hidden border border-gray-100 h-28">
                            <iframe
                                src="https://www.openstreetmap.org/export/embed.html?bbox=80.32%2C26.44%2C80.37%2C26.48&layer=mapnik&marker=26.46%2C80.35"
                                className="w-full h-full border-0"
                                title="Delivery location map"
                                loading="lazy"
                            />
                        </div>

                        {/* Change Address Button */}
                        <div className="px-4 pb-4">
                            <button className="w-full py-2.5 border-2 border-[#F05359]/20 rounded-2xl text-[#F05359] text-xs font-bold hover:bg-[#F05359]/5 transition-colors active:scale-[0.98]">
                                Change Address
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Order Summary ────────────────────────────── */}
                <section className="mb-5">
                    <div className="flex justify-between items-baseline mb-3">
                        <h2 className="text-base font-bold text-gray-900">Order Summary</h2>
                        <span className="text-xs font-bold text-[#F05359]">{totalItems} Items</span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 text-[#F05359] animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl">
                            <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">Your cart is empty</p>
                            <button
                                onClick={() => setActiveSection("store")}
                                className="mt-4 px-6 py-2 bg-[#F05359] text-white rounded-xl text-sm font-bold"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.productId} className="bg-white rounded-3xl p-3 flex gap-3 shadow-sm border border-gray-100/60">
                                    {/* Product Image */}
                                    <div className="w-[72px] h-[72px] rounded-2xl bg-gray-50 shrink-0 overflow-hidden border border-gray-100">
                                        {(item as any).image ? (
                                            <img
                                                src={(item as any).image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingCart className="w-6 h-6 text-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-1">{item.name}</h4>
                                            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                                                {(item as any).description || item.name}
                                            </p>
                                        </div>
                                        <span className="font-bold text-[#F05359] text-sm">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex flex-col items-center justify-between py-0.5">
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all"
                                        >
                                            <Minus className="w-3 h-3 text-gray-500" />
                                        </button>
                                        <span className="text-xs font-bold text-gray-900">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            className="w-7 h-7 rounded-full bg-[#F05359] flex items-center justify-center text-white shadow-sm shadow-red-200 active:scale-90 transition-all"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Payment Method ───────────────────────────── */}
                <section className="mb-5">
                    <h2 className="text-base font-bold text-gray-900 mb-3">Payment Method</h2>
                    <div className="flex gap-3">
                        {paymentMethods.map(method => (
                            <button
                                key={method.id}
                                onClick={() => setSelectedPayment(method.id)}
                                className={cn(
                                    "flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all active:scale-95",
                                    selectedPayment === method.id
                                        ? "border-[#F05359] bg-[#F05359]/5 text-[#F05359]"
                                        : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                    selectedPayment === method.id
                                        ? "bg-[#F05359] text-white"
                                        : "bg-gray-50 text-gray-400"
                                )}>
                                    {method.icon}
                                </div>
                                <span className="text-[11px] font-bold">{method.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Price Breakdown ──────────────────────────── */}
                <section className="mb-4">
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100/60">
                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 font-medium">Subtotal</span>
                                <span className="text-sm font-bold text-gray-800">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 font-medium">Delivery Fee</span>
                                <span className="text-sm font-bold text-green-500">FREE</span>
                            </div>
                        </div>

                        {/* Impact Contribution */}
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-3 flex items-center gap-3 mb-4 border border-pink-100/50">
                            <div className="w-9 h-9 rounded-xl bg-[#F05359] flex items-center justify-center shrink-0 shadow-sm shadow-red-200">
                                <Heart className="w-4 h-4 text-white fill-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-[#F05359]">Your Impact</p>
                                <p className="text-[10px] text-gray-500 font-medium leading-tight">
                                    ₹10 contribution to<br />Stray Rescue Fund
                                </p>
                            </div>
                            <span className="text-sm font-bold text-[#F05359]">+₹{impactContribution.toFixed(2)}</span>
                        </div>

                        {/* Grand Total */}
                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                            <span className="text-base font-black text-gray-900">Grand Total</span>
                            <span className="text-xl font-black text-[#F05359]">₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Place Order Button ──────────────────────────── */}
            <div className="fixed bottom-[72px] left-0 right-0 max-w-[430px] mx-auto p-4 bg-gradient-to-t from-white via-white to-white/80 z-40">
                <button
                    onClick={() => setActiveSection("order-confirmation")}
                    className="w-full bg-[#F05359] text-white h-14 rounded-full font-black text-base shadow-xl shadow-red-200/50 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                >
                    Place Order
                    <span className="text-lg">🐾</span>
                </button>
            </div>
        </>
    );
}
