"use client";

import { cn } from "@/lib/utils";
import { useSection, SectionType } from "@/context/SectionContext";
import {
    Home,
    PawPrint,
    ShoppingBag,
    Star,
    Users,
} from "lucide-react";

const NAV_ITEMS: { icon: typeof Home; label: string; section: SectionType; highlight?: boolean }[] = [
    { icon: Home, label: "Home", section: "home" },
    { icon: PawPrint, label: "Pets", section: "pets" },
    { icon: ShoppingBag, label: "Store", section: "store", highlight: true },
    { icon: Star, label: "Rescue", section: "rescue" },
    { icon: Users, label: "Community", section: "community" },
];

export function BottomNav() {
    const { activeSection, setActiveSection } = useSection();

    return (
        <nav className="sticky bottom-0 z-50 bg-white border-t border-gray-100 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
            <div className="flex justify-around items-center px-2 py-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeSection === item.section;

                    return (
                        <button
                            key={item.label}
                            onClick={() => setActiveSection(item.section)}
                            className={cn(
                                "flex flex-col items-center gap-1 min-w-[56px] transition-all duration-300",
                                isActive ? "text-[#F05359]" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {item.highlight ? (
                                <div
                                    className={cn(
                                        "w-11 h-11 rounded-full flex items-center justify-center -mt-3 shadow-lg transition-all duration-300",
                                        isActive
                                            ? "bg-[#F05359] text-white shadow-red-200"
                                            : "bg-[#F05359] text-white shadow-red-200"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" strokeWidth={2} />
                                </div>
                            ) : (
                                <div className="relative">
                                    <item.icon
                                        className={cn(
                                            "w-5 h-5 transition-all duration-300",
                                            isActive ? "text-[#F05359]" : "text-gray-400"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                </div>
                            )}
                            <span
                                className={cn(
                                    "text-[10px] transition-all duration-300",
                                    isActive ? "font-bold text-[#F05359]" : "font-medium text-gray-400",
                                    item.highlight && "-mt-0.5"
                                )}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
