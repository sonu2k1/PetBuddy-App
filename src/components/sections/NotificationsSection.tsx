"use client";

import { useState } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSection } from "@/context/SectionContext";

const TABS = ["All", "Activity", "Rescue", "Offers"];

const NOTIFICATIONS = [
    {
        id: 1,
        type: "PET UPDATE",
        typeColor: "text-[#F05359]",
        time: "2h ago",
        title: "Buddy has a vaccination appointment tomorrow at 10:00 AM.",
        cta: "View Details  ›",
        ctaColor: "text-[#F05359]",
        avatar: null,
        accentBorder: "border-l-4 border-[#F05359]",
        icon: "🐾",
        iconBg: "bg-pink-100",
        quote: null,
        ctaButton: false,
    },
    {
        id: 2,
        type: "RESCUE UPDATE",
        typeColor: "text-gray-500",
        time: "5h ago",
        title: "Rescue report #124 status updated:",
        highlight: "On the way.",
        highlightColor: "text-[#F05359]",
        avatar: null,
        accentBorder: "",
        icon: "🚨",
        iconBg: "bg-orange-50",
        quote: null,
        ctaButton: false,
        cta: null,
        ctaColor: null,
    },
    {
        id: 3,
        type: "LIMITED OFFER",
        typeColor: "text-[#F05359]",
        time: "Yesterday",
        title: "20% Off on Dog Food! Claim your coupon now before it expires.",
        avatar: null,
        accentBorder: "",
        icon: "🏷️",
        iconBg: "bg-red-50",
        quote: null,
        ctaButton: true,
        ctaButtonText: "Claim Now",
        cta: null,
        ctaColor: null,
    },
    {
        id: 4,
        type: "COMMUNITY",
        typeColor: "text-gray-500",
        time: "1d ago",
        title: "Dr. Sharma replied to your comment on health tips.",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop",
        accentBorder: "",
        icon: null,
        iconBg: null,
        quote: '"Make sure to keep Buddy hydrated durin...',
        ctaButton: false,
        cta: null,
        ctaColor: null,
    },
    {
        id: 5,
        type: "SUPPORT",
        typeColor: "text-gray-500",
        time: "2d ago",
        title: "Your support ticket #882 has been resolved.",
        avatar: null,
        accentBorder: "",
        icon: "📋",
        iconBg: "bg-purple-50",
        quote: null,
        ctaButton: false,
        cta: null,
        ctaColor: null,
    },
];

export function NotificationsSection() {
    const { setActiveSection } = useSection();
    const [activeTab, setActiveTab] = useState("All");

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

                {/* Tabs */}
                <div className="flex gap-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-5 py-2 rounded-full text-sm font-semibold transition-all border",
                                activeTab === tab
                                    ? "bg-[#F05359] text-white border-[#F05359] shadow-lg shadow-red-100"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <main className="px-4 py-4 pb-32 space-y-3">
                {NOTIFICATIONS.map((notif) => (
                    <div
                        key={notif.id}
                        className={cn(
                            "bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md",
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
                                        notif.iconBg
                                    )}
                                >
                                    {notif.icon}
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span
                                        className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider",
                                            notif.typeColor
                                        )}
                                    >
                                        {notif.type}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium">{notif.time}</span>
                                </div>

                                <p className="text-sm font-semibold text-gray-800 leading-snug mb-1">
                                    {notif.title}
                                    {notif.highlight && (
                                        <>
                                            <br />
                                            <span className={notif.highlightColor}>{notif.highlight}</span>
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
                                {notif.cta && (
                                    <button className={cn("text-sm font-semibold mt-1", notif.ctaColor)}>
                                        {notif.cta}
                                    </button>
                                )}

                                {/* CTA Button */}
                                {notif.ctaButton && (
                                    <button className="mt-2 bg-[#F05359] text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg shadow-red-100 hover:bg-[#e0484e] transition-colors">
                                        {notif.ctaButtonText}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </main>
        </>
    );
}
