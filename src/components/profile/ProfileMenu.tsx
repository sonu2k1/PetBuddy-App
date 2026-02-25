"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChevronRight, Package, Dog, Wallet, MapPin, HelpCircle, Settings, LogOut, Loader2 } from "lucide-react";

export function ProfileMenu() {
    const { logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch {
            // Logout anyway
        } finally {
            setIsLoggingOut(false);
        }
    };

    const MENU_ITEMS = [
        { icon: Package, label: "My Orders", color: "text-blue-500" },
        { icon: Dog, label: "My Pets", color: "text-pink-500" },
        { icon: Wallet, label: "Wallet", color: "text-green-500", badge: "$124.00" },
        { icon: MapPin, label: "Addresses", color: "text-orange-500" },
    ];

    const SUPPORT_ITEMS = [
        { icon: HelpCircle, label: "Help & Support" },
        { icon: Settings, label: "Settings" },
    ];

    return (
        <div className="px-4 pb-24 paw-bg">
            <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100/50 mb-4 bubble-card">
                {MENU_ITEMS.map((item) => (
                    <button key={item.label} className="w-full flex items-center justify-between p-4 hover:bg-pink-50/30 transition-all border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 ${item.color}`}>
                                <item.icon className="w-4.5 h-4.5" />
                            </div>
                            <span className="font-bold text-sm text-gray-800">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.badge && <span className="text-[11px] font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full">{item.badge}</span>}
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100/50 mb-6 bubble-card">
                {SUPPORT_ITEMS.map((item) => (
                    <button key={item.label} className="w-full flex items-center justify-between p-4 hover:bg-pink-50/30 transition-all border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                <item.icon className="w-4.5 h-4.5" />
                            </div>
                            <span className="font-bold text-sm text-gray-800">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                ))}
            </div>

            <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 text-[#F05359] font-black p-4 bg-red-50/50 hover:bg-red-50 rounded-[24px] transition-all active:scale-95 border border-red-100/50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isLoggingOut ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                    <LogOut className="w-4.5 h-4.5" />
                )}
                <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
            </button>
        </div>
    );
}
