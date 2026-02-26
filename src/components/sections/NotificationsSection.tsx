"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Settings, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSection } from "@/context/SectionContext";

// Tab → category mapping
const TABS = ["All", "Activity", "Rescue", "Offers"] as const;
type Tab = typeof TABS[number];

const NOTIFICATIONS = [
    {
        id: 1,
        category: "Activity" as Tab,
        type: "PET UPDATE",
        typeColor: "text-[#F05359]",
        time: "2h ago",
        title: "Buddy has a vaccination appointment tomorrow at 10:00 AM.",
        cta: "View Details  ›",
        ctaColor: "text-[#F05359]",
        avatar: null as string | null,
        accentBorder: "border-l-4 border-[#F05359]",
        icon: "🐾",
        iconBg: "bg-pink-100",
        quote: null as string | null,
        ctaButton: false,
        highlight: null as string | null,
        highlightColor: null as string | null,
        ctaButtonText: null as string | null,
    },
    {
        id: 2,
        category: "Rescue" as Tab,
        type: "RESCUE UPDATE",
        typeColor: "text-orange-500",
        time: "5h ago",
        title: "Rescue report #124 status updated:",
        highlight: "On the way.",
        highlightColor: "text-[#F05359]",
        avatar: null as string | null,
        accentBorder: "border-l-4 border-orange-400",
        icon: "🚨",
        iconBg: "bg-orange-50",
        quote: null as string | null,
        ctaButton: false,
        cta: null as string | null,
        ctaColor: null as string | null,
        ctaButtonText: null as string | null,
    },
    {
        id: 3,
        category: "Offers" as Tab,
        type: "LIMITED OFFER",
        typeColor: "text-[#F05359]",
        time: "Yesterday",
        title: "20% Off on Dog Food! Claim your coupon now before it expires.",
        avatar: null as string | null,
        accentBorder: "border-l-4 border-yellow-400",
        icon: "🏷️",
        iconBg: "bg-red-50",
        quote: null as string | null,
        ctaButton: true,
        ctaButtonText: "Claim Now",
        cta: null as string | null,
        ctaColor: null as string | null,
        highlight: null as string | null,
        highlightColor: null as string | null,
    },
    {
        id: 4,
        category: "Activity" as Tab,
        type: "COMMUNITY",
        typeColor: "text-gray-500",
        time: "1d ago",
        title: "Dr. Sharma replied to your comment on health tips.",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop",
        accentBorder: "",
        icon: null as string | null,
        iconBg: null as string | null,
        quote: '"Make sure to keep Buddy hydrated durin...',
        ctaButton: false,
        cta: null as string | null,
        ctaColor: null as string | null,
        highlight: null as string | null,
        highlightColor: null as string | null,
        ctaButtonText: null as string | null,
    },
    {
        id: 5,
        category: "Activity" as Tab,
        type: "SUPPORT",
        typeColor: "text-gray-500",
        time: "2d ago",
        title: "Your support ticket #882 has been resolved.",
        avatar: null as string | null,
        accentBorder: "",
        icon: "📋",
        iconBg: "bg-purple-50",
        quote: null as string | null,
        ctaButton: false,
        cta: null as string | null,
        ctaColor: null as string | null,
        highlight: null as string | null,
        highlightColor: null as string | null,
        ctaButtonText: null as string | null,
    },
];

export function NotificationsSection() {
    const { setActiveSection } = useSection();
    const [activeTab, setActiveTab] = useState<Tab>("All");

    // Filter notifications by active tab
    const filtered = useMemo(
        () =>
            activeTab === "All"
                ? NOTIFICATIONS
                : NOTIFICATIONS.filter((n) => n.category === activeTab),
        [activeTab]
    );

    // Count per tab for badges
    const counts = useMemo(() => {
        const map: Record<string, number> = { All: NOTIFICATIONS.length };
        for (const tab of TABS.slice(1)) {
            map[tab] = NOTIFICATIONS.filter((n) => n.category === tab).length;
        }
        return map;
    }, []);

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm px-4 pt-4 pb-3">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => setActiveSection("home")}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <Settings className="w-5 h-5 text-gray-700" />
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-semibold transition-all border shrink-0 flex items-center gap-1.5",
                                activeTab === tab
                                    ? "bg-[#F05359] text-white border-[#F05359] shadow-lg shadow-red-100"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                            )}
                        >
                            {tab}
                            {counts[tab] > 0 && (
                                <span
                                    className={cn(
                                        "text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none",
                                        activeTab === tab
                                            ? "bg-white/25 text-white"
                                            : "bg-gray-100 text-gray-500"
                                    )}
                                >
                                    {counts[tab]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <main className="px-4 py-4 pb-32 paw-bg">
                {filtered.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <BellOff className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-base font-bold text-gray-400">No {activeTab} notifications</p>
                        <p className="text-sm text-gray-300 mt-1">You&apos;re all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((notif) => (
                            <div
                                key={notif.id}
                                className={cn(
                                    "bg-white rounded-3xl p-4 border border-gray-100 transition-all bubble-card",
                                    notif.accentBorder
                                )}
                            >
                                <div className="flex gap-3">
                                    {/* Avatar / Icon */}
                                    {notif.avatar ? (
                                        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                            <img
                                                src={notif.avatar}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className={cn(
                                                "w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-lg",
                                                notif.iconBg ?? "bg-gray-100"
                                            )}
                                        >
                                            {notif.icon ?? "🔔"}
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <span
                                                className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider",
                                                    notif.typeColor
                                                )}
                                            >
                                                {notif.type}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                                {notif.time}
                                            </span>
                                        </div>

                                        <p className="text-sm font-semibold text-gray-800 leading-snug mb-1">
                                            {notif.title}
                                            {notif.highlight && (
                                                <>
                                                    <br />
                                                    <span className={notif.highlightColor ?? "text-gray-500"}>
                                                        {notif.highlight}
                                                    </span>
                                                </>
                                            )}
                                        </p>

                                        {/* Quote */}
                                        {notif.quote && (
                                            <div className="bg-gray-50 rounded-xl px-3 py-2 mt-2">
                                                <p className="text-xs text-gray-500 italic truncate">{notif.quote}</p>
                                            </div>
                                        )}

                                        {/* CTA Link */}
                                        {"cta" in notif && notif.cta && (
                                            <button className={cn("text-sm font-semibold mt-1", notif.ctaColor ?? "text-[#F05359]")}>
                                                {notif.cta}
                                            </button>
                                        )}

                                        {/* CTA Button */}
                                        {notif.ctaButton && notif.ctaButtonText && (
                                            <button className="mt-2 bg-[#F05359] text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg shadow-red-100 hover:bg-[#e0484e] transition-colors">
                                                {notif.ctaButtonText}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
