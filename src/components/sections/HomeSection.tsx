"use client";

import { useSection } from "@/context/SectionContext";
import {
    MapPin,
    Bell,
    Search,
    PawPrint,
    ShoppingBag,
    Heart,
    Users,
    Star,
    Plus,
    ChevronRight,
    Syringe,
} from "lucide-react";

const QUICK_ACTIONS = [
    {
        icon: <PawPrint className="w-6 h-6 text-[#F05359]" />,
        label: "Pet Management",
        section: "pets" as const,
        bg: "bg-red-50",
    },
    {
        icon: <ShoppingBag className="w-6 h-6 text-[#F05359]" />,
        label: "Quick Store",
        section: "store" as const,
        bg: "bg-orange-50",
    },
    {
        icon: <Heart className="w-6 h-6 text-[#F05359]" />,
        label: "Rescue Help",
        section: "rescue" as const,
        bg: "bg-pink-50",
    },
    {
        icon: <Users className="w-6 h-6 text-[#F05359]" />,
        label: "Community",
        section: "community" as const,
        bg: "bg-purple-50",
    },
];

const SPECIAL_OFFERS = [
    {
        id: 1,
        tag: "LIMITED TIME",
        title: "30% off on Grooming",
        subtitle: "For your first spa session",
        cta: "Book Now",
        gradient: "from-[#F05359] to-[#FF8A9B]",
    },
    {
        id: 2,
        tag: "EXCLUSIVE",
        title: "Free Vet Consultation",
        subtitle: "New pet parents only",
        cta: "Claim",
        gradient: "from-[#FF8A9B] to-[#FFB5C2]",
    },
];

const FEATURED_SERVICES = [
    {
        id: 1,
        name: "Swastik Vet Clinic",
        type: "Nearby Vets • 1.2 km away",
        rating: 4.8,
        tags: ["Open 24/7", "Emergency"],
        image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=100&h=100&fit=crop",
    },
    {
        id: 2,
        name: "Kanpur Pet Walkers",
        type: "Pet Walkers • Trusted by 200+ owners",
        rating: 4.9,
        tags: ["Verified", "Daily Slots"],
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop",
    },
];

export function HomeSection() {
    const { setActiveSection } = useSection();

    return (
        <>
            {/* Header */}
            <header className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F05359] flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Hello, Kanpur!</h1>
                            <p className="text-xs text-gray-500">Civil Lines, Kanpur</p>
                        </div>
                    </div>
                    <button onClick={() => setActiveSection("notifications")} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative">
                        <Bell className="w-5 h-5 text-gray-700" />
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#F05359] rounded-full border-2 border-white" />
                    </button>
                </div>
            </header>

            <main className="pb-32">
                {/* Search Bar */}
                <div className="px-4 py-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl flex items-center px-4 py-3">
                        <Search className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Search pets, services, products"
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 font-medium"
                        />
                    </div>
                </div>

                {/* Smart Reminder */}
                <div className="px-4 py-2">
                    <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl p-4 flex items-center gap-3 border border-pink-200">
                        <div className="w-12 h-12 bg-[#F05359] rounded-xl flex items-center justify-center shrink-0">
                            <Syringe className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-[#F05359] uppercase tracking-wider mb-0.5">Smart Reminder</p>
                            <p className="text-sm font-bold text-gray-900 leading-tight">
                                Bruno&apos;s Vaccination in 2 days
                            </p>
                        </div>
                        <button className="bg-[#F05359] text-white px-4 py-1.5 rounded-full text-xs font-bold shrink-0 hover:bg-[#e0484e] transition-colors">
                            View
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => setActiveSection(action.section)}
                                className={`${action.bg} rounded-2xl p-4 flex flex-col items-start gap-3 hover:shadow-md transition-shadow border border-gray-100/50 text-left`}
                            >
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    {action.icon}
                                </div>
                                <span className="text-sm font-bold text-gray-800">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Special Offers */}
                <div className="py-4">
                    <div className="flex justify-between items-center px-4 mb-3">
                        <h2 className="text-lg font-bold text-gray-900">Special Offers</h2>
                        <button className="text-[#F05359] text-sm font-semibold">See All</button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
                        {SPECIAL_OFFERS.map((offer) => (
                            <div
                                key={offer.id}
                                className={`bg-gradient-to-br ${offer.gradient} rounded-2xl p-4 min-w-[260px] shrink-0 relative overflow-hidden`}
                            >
                                {/* Decorative circles */}
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
                                <div className="absolute -right-2 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />

                                <div className="relative z-10">
                                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2">
                                        {offer.tag}
                                    </span>
                                    <h3 className="text-xl font-black text-white leading-tight mb-1">
                                        {offer.title}
                                    </h3>
                                    <p className="text-xs text-white/80 font-medium mb-3">
                                        {offer.subtitle}
                                    </p>
                                    <button className="bg-white text-[#F05359] px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors">
                                        {offer.cta}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Featured Services */}
                <div className="px-4 py-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Featured Services</h2>
                    <div className="space-y-3">
                        {FEATURED_SERVICES.map((service) => (
                            <div
                                key={service.id}
                                className="bg-white rounded-2xl p-3 flex items-center gap-3 border border-gray-100 shadow-sm"
                            >
                                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                                    <img
                                        src={service.image}
                                        alt={service.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className="font-bold text-gray-900 text-sm truncate">{service.name}</h3>
                                        <div className="flex items-center gap-1 shrink-0 ml-2">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-xs font-bold text-gray-700">{service.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mb-1.5">{service.type}</p>
                                    <div className="flex gap-2">
                                        {service.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-6 z-40 max-w-[430px]">
                <button className="w-14 h-14 bg-[#F05359] rounded-full flex items-center justify-center shadow-xl shadow-red-300 hover:bg-[#e0484e] transition-colors">
                    <Plus className="w-6 h-6 text-white" />
                </button>
            </div>
        </>
    );
}
