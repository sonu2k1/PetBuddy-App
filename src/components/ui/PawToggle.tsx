"use client";

import { cn } from "@/lib/utils";

interface PawToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    variant?: "paw" | "bone";
    size?: "sm" | "md" | "lg";
    label?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Pet-themed toggle switch with a paw print 🐾 or bone 🦴 thumb.
 */
export function PawToggle({
    checked,
    onChange,
    variant = "paw",
    size = "md",
    label,
    disabled = false,
    className,
}: PawToggleProps) {
    const sizes = {
        sm: { track: "w-10 h-[22px]", thumb: "w-[18px] h-[18px] text-[9px]", translate: "translateX(18px)" },
        md: { track: "w-[52px] h-7", thumb: "w-6 h-6 text-xs", translate: "translateX(24px)" },
        lg: { track: "w-16 h-8", thumb: "w-7 h-7 text-sm", translate: "translateX(32px)" },
    };

    const s = sizes[size];

    return (
        <label
            className={cn(
                "inline-flex items-center gap-2.5 cursor-pointer select-none",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <button
                role="switch"
                type="button"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    "relative rounded-full transition-all duration-300 border-0 p-0 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05359]/40 focus-visible:ring-offset-2",
                    s.track,
                    checked
                        ? "bg-gradient-to-r from-[#F05359] to-[#FF8A9B]"
                        : "bg-gray-200"
                )}
            >
                {/* Track decoration */}
                <span
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 text-[10px] transition-all duration-300 opacity-50",
                        checked ? "left-2" : "right-2"
                    )}
                >
                    {variant === "bone" ? "🦴" : "🐾"}
                </span>

                {/* Thumb with paw/bone */}
                <span
                    className={cn(
                        "absolute top-[2px] left-[2px] rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                        s.thumb
                    )}
                    style={{
                        transform: checked ? s.translate : "translateX(0px)",
                    }}
                >
                    <span className="leading-none">
                        {variant === "bone" ? "🦴" : "🐾"}
                    </span>
                </span>
            </button>

            {label && (
                <span className="text-sm font-medium text-gray-700">{label}</span>
            )}
        </label>
    );
}
