"use client";

import { useEffect, useRef, useState } from "react";
import { Syringe, ChevronLeft, ChevronRight, PawPrint, ExternalLink } from "lucide-react";
import { VaccinationRecord } from "@/hooks/useData";
import { useSection } from "@/context/SectionContext";

interface VaccinationCarouselProps {
    vaccinations: VaccinationRecord[];
    isLoading: boolean;
}

function formatVaccinationDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? "s" : ""} ago`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
}

function formatFullDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// Colour palette rotated by index for visual variety
const CARD_THEMES = [
    {
        gradient: "from-[#F05359] to-[#FF8A9B]",
        light: "bg-red-50",
        border: "border-red-200/60",
        accent: "text-[#F05359]",
        pill: "bg-[#F05359]/10 text-[#F05359]",
        dot: "bg-[#F05359]",
    },
    {
        gradient: "from-blue-500 to-blue-400",
        light: "bg-blue-50",
        border: "border-blue-200/60",
        accent: "text-blue-600",
        pill: "bg-blue-100 text-blue-600",
        dot: "bg-blue-500",
    },
    {
        gradient: "from-emerald-500 to-teal-400",
        light: "bg-emerald-50",
        border: "border-emerald-200/60",
        accent: "text-emerald-600",
        pill: "bg-emerald-100 text-emerald-600",
        dot: "bg-emerald-500",
    },
    {
        gradient: "from-purple-500 to-purple-400",
        light: "bg-purple-50",
        border: "border-purple-200/60",
        accent: "text-purple-600",
        pill: "bg-purple-100 text-purple-600",
        dot: "bg-purple-500",
    },
    {
        gradient: "from-amber-500 to-orange-400",
        light: "bg-amber-50",
        border: "border-amber-200/60",
        accent: "text-amber-600",
        pill: "bg-amber-100 text-amber-600",
        dot: "bg-amber-500",
    },
];

export function VaccinationCarousel({ vaccinations, isLoading }: VaccinationCarouselProps) {
    const { setActiveSection } = useSection();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState<"left" | "right">("right");
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const total = vaccinations.length;

    const goTo = (nextIndex: number, dir: "left" | "right" = "right") => {
        if (isAnimating || total <= 1) return;
        setDirection(dir);
        setIsAnimating(true);
        setTimeout(() => {
            setActiveIndex(nextIndex);
            setIsAnimating(false);
        }, 300);
    };

    const goNext = () => {
        const next = (activeIndex + 1) % total;
        goTo(next, "right");
    };

    const goPrev = () => {
        const prev = (activeIndex - 1 + total) % total;
        goTo(prev, "left");
    };

    // Auto-rotate every 10 seconds
    useEffect(() => {
        if (total <= 1 || isPaused) return;

        intervalRef.current = setInterval(() => {
            setDirection("right");
            setIsAnimating(true);
            setTimeout(() => {
                setActiveIndex((cur) => (cur + 1) % total);
                setIsAnimating(false);
            }, 300);
        }, 10000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [total, isPaused, activeIndex]);

    // ── Loading skeleton ──────────────────────────────────────
    if (isLoading) {
        return (
            <div className="px-4 py-2">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-[#F05359]" />
                        <p className="text-sm font-bold text-gray-700">Vaccination History</p>
                    </div>
                </div>
                <div className="bg-gray-100 rounded-3xl h-[130px] animate-pulse" />
            </div>
        );
    }

    // ── Empty state ───────────────────────────────────────────
    if (total === 0) {
        return (
            <div className="px-4 py-2">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-4 flex items-center gap-3 border border-blue-200/60">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                        <Syringe className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">
                            Vaccination History
                        </p>
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                            No vaccinations recorded yet
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Add records in Pet Profile</p>
                    </div>
                    <button
                        onClick={() => setActiveSection("pets")}
                        className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shrink-0 hover:bg-blue-600 transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>
        );
    }

    const vax = vaccinations[activeIndex];
    const theme = CARD_THEMES[activeIndex % CARD_THEMES.length];

    return (
        <div className="px-4 py-2">
            {/* Section header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-[#F05359]" />
                    <p className="text-sm font-bold text-gray-700">Vaccination History</p>
                    {total > 1 && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {total}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setActiveSection("pets")}
                    className="text-xs text-[#F05359] font-semibold flex items-center gap-1"
                >
                    View All
                    <ExternalLink className="w-3 h-3" />
                </button>
            </div>

            {/* Carousel card */}
            <div
                className="relative overflow-hidden"
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* The card */}
                <div
                    key={activeIndex}
                    className={`relative overflow-hidden rounded-3xl border ${theme.border} ${theme.light} p-4 transition-all duration-300 ${isAnimating
                            ? direction === "right"
                                ? "opacity-0 translate-x-4"
                                : "opacity-0 -translate-x-4"
                            : "opacity-100 translate-x-0"
                        }`}
                    style={{ willChange: "opacity, transform" }}
                >
                    {/* Decorative blobs */}
                    <div className={`absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br ${theme.gradient} rounded-full opacity-10`} />
                    <div className={`absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br ${theme.gradient} rounded-full opacity-10`} />

                    <div className="relative z-10 flex items-start gap-3">
                        {/* Pet avatar / syringe icon */}
                        <div className="shrink-0">
                            {vax.petId.imageUrl ? (
                                <img
                                    src={vax.petId.imageUrl}
                                    alt={vax.petId.name}
                                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
                                />
                            ) : (
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm`}>
                                    <PawPrint className="w-6 h-6 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-[10px] font-black uppercase tracking-wider ${theme.accent}`}>
                                    {vax.petId.name}
                                </span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${theme.pill}`}>
                                    Vaccination
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-1">
                                {vax.notes || "Vaccination record"}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                                <p className="text-xs text-gray-500 font-medium">
                                    📅 {formatFullDate(vax.date)}
                                </p>
                                <span className="text-gray-300">·</span>
                                <p className="text-xs text-gray-400">
                                    {formatVaccinationDate(vax.date)}
                                </p>
                            </div>
                        </div>

                        {/* Nav arrows (only if multiple) */}
                        {total > 1 && (
                            <div className="flex gap-1 shrink-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                                    className="w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                                    className="w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Progress bar for auto-advance */}
                    {total > 1 && !isPaused && (
                        <div className="mt-3 h-0.5 bg-black/5 rounded-full overflow-hidden">
                            <div
                                key={`progress-${activeIndex}`}
                                className={`h-full rounded-full bg-gradient-to-r ${theme.gradient}`}
                                style={{
                                    animation: "vacProgressBar 10s linear forwards",
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Dot indicators */}
                {total > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                        {vaccinations.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i, i > activeIndex ? "right" : "left")}
                                className={`transition-all duration-300 rounded-full ${i === activeIndex
                                        ? `w-5 h-1.5 ${theme.dot}`
                                        : "w-1.5 h-1.5 bg-gray-300"
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Inline CSS for progress bar animation */}
            <style>{`
                @keyframes vacProgressBar {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
            `}</style>
        </div>
    );
}
