"use client";

import { useMemo, useState } from "react";
import { useSection } from "@/context/SectionContext";
import { useAuth } from "@/context/AuthContext";
import { usePets, useReminders, useVaccinations } from "@/hooks/useData";
import { VaccinationCarousel } from "@/components/home/VaccinationCarousel";
import { useLocation } from "@/hooks/useLocation";
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
    Cake,
    Gift,
    LogOut,
    Loader2,
    Utensils,
    Sun,
    Sunrise,
    Moon,
    Clock,
} from "lucide-react";

/* ─── Helpers ─── */
function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

function getBirthdayCountdown(birthday: Date) {
    const now = new Date();
    const thisYear = now.getFullYear();

    // Next occurrence of the birthday
    let next = new Date(thisYear, birthday.getMonth(), birthday.getDate());
    if (next.getTime() <= now.getTime()) {
        next = new Date(thisYear + 1, birthday.getMonth(), birthday.getDate());
    }

    const diff = next.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const isToday = days === 0 && hours < 24;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateLabel = `${birthday.getDate()} ${monthNames[birthday.getMonth()]}`;

    return { days, hours, minutes, isToday, dateLabel };
}

const QUICK_ACTIONS = [
    {
        icon: <PawPrint className="w-6 h-6 text-[#ef6c00]" />,
        label: "My Pets",
        sublabel: "Manage profiles & records",
        section: "pets" as const,
        bgColor: "bg-white",
        iconBg: "bg-[#fff3e0]",
        blobColor: "bg-[#ffe0b2]/60",
        active: false,
    },
    {
        icon: <ShoppingBag className="w-6 h-6 text-[#1565c0]" />,
        label: "Quick Store",
        sublabel: "Shop essentials fast",
        section: "store" as const,
        bgColor: "bg-white",
        iconBg: "bg-[#e3f2fd]",
        blobColor: "bg-[#bbdefb]/60",
        active: false,
    },
    {
        icon: <Plus className="w-6 h-6 text-white" strokeWidth={3} />,
        label: "Rescue Help",
        sublabel: "Emergency SOS & Vets",
        section: "rescue" as const,
        bgColor: "bg-[#F05359]",
        iconBg: "bg-white/20",
        blobColor: "bg-white/10",
        active: true,
        textColor: "text-white",
        subLabelColor: "text-white/80",
    },
    {
        icon: <Users className="w-6 h-6 text-[#2e7d32]" />,
        label: "Community",
        sublabel: "Connect with parents",
        section: "community" as const,
        bgColor: "bg-white",
        iconBg: "bg-[#e8f5e9]",
        blobColor: "bg-[#c8e6c9]/60",
        active: false,
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
    const { user, logout } = useAuth();
    const { pets } = usePets();
    const { reminders } = useReminders();
    const { vaccinations, isLoading: isLoadingVax } = useVaccinations();
    const location = useLocation();
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

    // Use first pet's data or fallback
    const firstPet = pets[0];
    const petName = firstPet?.name || "Buddy";
    const petBirthday = firstPet?.dob ? new Date(firstPet.dob) : new Date(2023, 5, 15);

    const greeting = useMemo(() => getGreeting(), []);
    const bday = useMemo(() => getBirthdayCountdown(petBirthday), [petBirthday]);

    // Get next upcoming reminder
    const nextReminder = useMemo(() => {
        if (!reminders.length) return null;
        const upcoming = reminders
            .filter((r) => r.isActive && new Date(r.scheduledAt) > new Date())
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        return upcoming[0] || null;
    }, [reminders]);

    // Format reminder time
    const reminderLabel = useMemo(() => {
        if (!nextReminder) return null;
        const d = new Date(nextReminder.scheduledAt);
        const now = new Date();
        const diffMs = d.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return "today";
        if (diffDays === 1) return "tomorrow";
        return `in ${diffDays} days`;
    }, [nextReminder]);

    return (
        <>
            {/* Header */}
            <header className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between gap-2">
                    {/* Left: avatar + greeting + location */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-[#F05359] flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base font-bold text-gray-900 truncate leading-tight">
                                {user?.name ? `${greeting}, ${user.name}! 🐾` : `${greeting}, ${petName}'s human! 🐾`}
                            </h1>

                            {/* ── Dynamic location chip ── */}
                            {location.status === "requesting" || location.status === "resolving" ? (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Loader2 className="w-3 h-3 text-[#F05359] animate-spin" />
                                    <span className="text-xs text-gray-400">
                                        {location.status === "requesting"
                                            ? "Detecting location…"
                                            : "Resolving address…"}
                                    </span>
                                </div>
                            ) : location.status === "success" && location.label ? (
                                <button
                                    onClick={location.request}
                                    title={location.fullAddress ?? undefined}
                                    className="flex items-center gap-1 mt-0.5 group"
                                >
                                    <MapPin className="w-3 h-3 text-[#F05359] shrink-0" />
                                    <span className="text-xs text-gray-500 group-hover:text-[#F05359] transition-colors truncate max-w-[160px]">
                                        {location.label}
                                    </span>
                                </button>
                            ) : location.status === "denied" ? (
                                <button
                                    onClick={location.request}
                                    className="flex items-center gap-1 mt-0.5 group"
                                >
                                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                    <span className="text-xs text-gray-400 group-hover:text-[#F05359] transition-colors">
                                        Tap to enable location
                                    </span>
                                </button>
                            ) : location.status === "error" || location.status === "unavailable" ? (
                                <button
                                    onClick={location.request}
                                    className="flex items-center gap-1 mt-0.5"
                                >
                                    <MapPin className="w-3 h-3 text-gray-300 shrink-0" />
                                    <span className="text-xs text-gray-400">Location unavailable</span>
                                </button>
                            ) : (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-gray-300 shrink-0" />
                                    <span className="text-xs text-gray-400">Locating…</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: notification + logout — always visible */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setActiveSection("notifications")}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative"
                            title="Notifications"
                        >
                            <Bell className="w-5 h-5 text-gray-700" />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#F05359] rounded-full border-2 border-white" />
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-60"
                            title="Log Out"
                        >
                            {isLoggingOut ? (
                                <Loader2 className="w-5 h-5 text-[#F05359] animate-spin" />
                            ) : (
                                <LogOut className="w-4 h-4 text-[#F05359]" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="pb-32 paw-bg">
                {/* Search Bar */}
                <div className="px-4 py-3">
                    <div className="bg-gray-50/80 border border-gray-200/60 rounded-3xl flex items-center px-4 py-3 bubble-sm">
                        <Search className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Search pets, services, products"
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 font-medium"
                        />
                    </div>
                </div>

                {/* Feeding Reminders */}
                <div className="px-4 py-2">
                    {reminders.filter(r => r.isActive && r.type.startsWith("feeding:")).length > 0 ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Utensils className="w-4 h-4 text-purple-500" />
                                    <p className="text-sm font-bold text-gray-700">Feeding Reminders</p>
                                </div>
                                <button
                                    onClick={() => setActiveSection("pets")}
                                    className="text-xs text-purple-500 font-semibold"
                                >
                                    Manage
                                </button>
                            </div>
                            {reminders
                                .filter(r => r.isActive && r.type.startsWith("feeding:"))
                                .slice(0, 3)
                                .map((reminder) => {
                                    const label = reminder.type.replace("feeding:", "");
                                    const d = new Date(reminder.scheduledAt);
                                    const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
                                    const h = d.getHours();
                                    const Icon = h >= 5 && h < 12 ? Sunrise : h >= 12 && h < 17 ? Sun : Moon;
                                    const iconColor = h >= 5 && h < 12 ? "text-amber-500" : h >= 12 && h < 17 ? "text-orange-500" : "text-indigo-500";
                                    const bgColor = h >= 5 && h < 12 ? "bg-amber-50" : h >= 12 && h < 17 ? "bg-orange-50" : "bg-indigo-50";
                                    const borderColor = h >= 5 && h < 12 ? "border-amber-100" : h >= 12 && h < 17 ? "border-orange-100" : "border-indigo-100";
                                    return (
                                        <div key={reminder._id} className={`${bgColor} border ${borderColor} rounded-2xl p-3.5 flex items-center gap-3`}>
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                                <Icon className={`w-5 h-5 ${iconColor}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    {typeof reminder.petId === "object" ? reminder.petId.name : "Pet"}
                                                </p>
                                                <p className="text-sm font-bold text-gray-900">{label} Feeding</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <p className="text-xs font-bold text-gray-700">{timeStr}</p>
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-0.5">Daily</p>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-3xl p-4 flex items-center gap-3 border border-purple-200/60 bubble-card">
                            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shrink-0">
                                <Utensils className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-0.5">Feeding Reminders</p>
                                <p className="text-sm font-bold text-gray-900 leading-tight">Set up daily feeding reminders</p>
                            </div>
                            <button
                                onClick={() => setActiveSection("pets")}
                                className="bg-purple-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shrink-0 hover:bg-purple-600 transition-colors"
                            >
                                Set Up
                            </button>
                        </div>
                    )}
                </div>

                {/* Next Upcoming Reminder / Smart Reminder */}
                {nextReminder && !nextReminder.type.startsWith("feeding:") && (
                    <div className="px-4 py-2">
                        <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-3xl p-4 flex items-center gap-3 border border-pink-200/60 bubble-card">
                            <div className="w-12 h-12 bg-[#F05359] rounded-xl flex items-center justify-center shrink-0">
                                <Syringe className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-[#F05359] uppercase tracking-wider mb-0.5">Smart Reminder</p>
                                <p className="text-sm font-bold text-gray-900 leading-tight">
                                    {nextReminder.type} · {reminderLabel}
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveSection("pets")}
                                className="bg-[#F05359] text-white px-4 py-1.5 rounded-full text-xs font-bold shrink-0 hover:bg-[#e0484e] transition-colors"
                            >
                                View
                            </button>
                        </div>
                    </div>
                )}

                {/* 🎂 Birthday Countdown */}
                <div className="px-4 py-2">
                    <div className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-pink-100 to-purple-100 rounded-3xl p-5 border border-pink-200/40 bubble-card">
                        {/* confetti-style floating dots */}
                        <div className="absolute top-3 right-8 w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="absolute top-6 right-4 w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                        <div className="absolute bottom-5 right-12 w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.6s' }} />
                        <div className="absolute top-4 left-[60%] w-1 h-1 rounded-full bg-[#F05359] animate-bounce" style={{ animationDelay: '0.15s' }} />

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-14 h-14 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                {bday.isToday ? (
                                    <span className="text-3xl">🥳</span>
                                ) : (
                                    <Cake className="w-7 h-7 text-[#F05359]" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                {bday.isToday ? (
                                    <>
                                        <p className="text-[10px] font-bold text-[#F05359] uppercase tracking-wider mb-0.5">🎉 Happy Birthday!</p>
                                        <p className="text-sm font-bold text-gray-900 leading-tight">
                                            It&apos;s {petName}&apos;s special day today!
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-0.5">
                                            🎂 {petName}&apos;s Birthday · {bday.dateLabel}
                                        </p>
                                        <div className="flex items-baseline gap-3 mt-1">
                                            <div className="text-center">
                                                <span className="text-2xl font-black text-gray-900 leading-none">{bday.days}</span>
                                                <span className="block text-[9px] text-gray-500 font-bold uppercase">days</span>
                                            </div>
                                            <span className="text-gray-300 text-lg font-light">:</span>
                                            <div className="text-center">
                                                <span className="text-2xl font-black text-gray-900 leading-none">{bday.hours}</span>
                                                <span className="block text-[9px] text-gray-500 font-bold uppercase">hrs</span>
                                            </div>
                                            <span className="text-gray-300 text-lg font-light">:</span>
                                            <div className="text-center">
                                                <span className="text-2xl font-black text-gray-900 leading-none">{bday.minutes}</span>
                                                <span className="block text-[9px] text-gray-500 font-bold uppercase">min</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <button className="w-10 h-10 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0 hover:bg-white transition-colors shadow-sm">
                                <Gift className="w-5 h-5 text-purple-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 💉 Vaccination History Carousel */}
                <VaccinationCarousel
                    vaccinations={vaccinations}
                    isLoading={isLoadingVax}
                />

                {/* What do you need? */}
                <div className="px-4 py-6">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">What do you need?</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => setActiveSection(action.section)}
                                className={`relative overflow-hidden ${action.bgColor} ${action.active ? 'shadow-xl shadow-[#F05359]/30 ring-1 ring-[#F05359]/10' : 'border border-gray-100/50'} p-5 flex flex-col items-start gap-4 transition-all text-left bubble-card min-h-[165px] group`}
                            >
                                {/* Decorative Blob */}
                                <div className={`absolute -top-7 -right-7 w-28 h-28 ${action.blobColor} rounded-full transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`} />

                                <div className={`relative z-10 w-12 h-12 ${action.iconBg} rounded-3xl flex items-center justify-center shadow-sm`}>
                                    {action.icon}
                                </div>

                                <div className="relative z-10">
                                    <h3 className={`text-base font-bold ${"textColor" in action ? action.textColor : 'text-gray-900'} leading-tight mb-1`}>
                                        {action.label}
                                    </h3>
                                    <p className={`text-[11px] font-medium ${"subLabelColor" in action ? action.subLabelColor : 'text-gray-500'} leading-snug opacity-90`}>
                                        {action.sublabel}
                                    </p>
                                </div>
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
                                className={`bg-gradient-to-br ${offer.gradient} p-4 min-w-[260px] shrink-0 relative overflow-hidden bubble-float`}
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
                                className="bg-white p-3 flex items-center gap-3 border border-gray-100/50 bubble-card"
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
